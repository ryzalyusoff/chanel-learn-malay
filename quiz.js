/* =========================================================
   quiz.js — Quiz engine
   Depends on:
     - data.js (window.MALAY_COURSE_DATA)
     - storage.js (window.MalayStorage)
     - ui.js (window.MalayUI) [optional for toast/update]
   ========================================================= */

(function () {
  const DATA = window.MALAY_COURSE_DATA;
  const Store = window.MalayStorage;
  const UI = window.MalayUI;

  if (!DATA || !Store) {
    console.error("Missing MALAY_COURSE_DATA or MalayStorage. Ensure script order is correct.");
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const quizArea = $("#quizArea");
  const tplQuizCard = $("#tplQuizCard");

  const QUIZ_LEN = 10;

  let state = {
    mode: "mixed", // mixed | en-to-ms | ms-to-en | typing
    index: 0,
    score: 0,
    questions: [],
    answered: false,
    sound: true,
  };

  /* ---------- Helpers ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function normalize(s) {
    return String(s ?? "").trim().toLowerCase();
  }

  function getPairs() {
    return DATA.phrasePairs || [];
  }

  function pickDistractors(correct, count = 3, dir = "ms") {
    const pairs = getPairs();
    const pool = pairs.map(p => p[dir]).filter(Boolean);
    const uniq = Array.from(new Set(pool)).filter(x => normalize(x) !== normalize(correct));
    const out = [];
    while (out.length < count && uniq.length) {
      const idx = Math.floor(Math.random() * uniq.length);
      out.push(uniq.splice(idx, 1)[0]);
    }
    return out;
  }

  function playSound(type) {
    // tiny beep synth (no external assets)
    const st = Store.getState();
    const enabled = ($("#quizAudioToggle")?.checked ?? st.settings?.sound) && st.settings?.sound;
    if (!enabled) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = type === "good" ? 740 : 220;
      g.gain.value = 0.06;
      o.start();
      o.stop(ctx.currentTime + 0.09);
      setTimeout(() => ctx.close(), 120);
    } catch (_) {}
  }

  /* ---------- Question builders ---------- */
  function buildQuestion(mode) {
    const pairs = getPairs();
    const pair = sample(pairs);

    // For typing, we ask one direction (randomly EN->MS more common)
    if (mode === "typing") {
      const enToMs = Math.random() < 0.7;
      if (enToMs) {
        return {
          type: "typing",
          prompt: `Type the Malay for: “${pair.en}”`,
          answer: pair.ms,
          displayAnswer: pair.ms,
        };
      } else {
        return {
          type: "typing",
          prompt: `Type the English for: “${pair.ms}”`,
          answer: pair.en,
          displayAnswer: pair.en,
        };
      }
    }

    // MCQ
    let dir = mode;
    if (mode === "mixed") {
      dir = Math.random() < 0.5 ? "en-to-ms" : "ms-to-en";
    }

    if (dir === "en-to-ms") {
      const correct = pair.ms;
      const distract = pickDistractors(correct, 3, "ms");
      const options = shuffle([correct, ...distract]);
      return {
        type: "mcq",
        direction: "en-to-ms",
        prompt: `What is “${pair.en}” in Malay?`,
        answer: correct,
        options,
      };
    } else {
      const correct = pair.en;
      const distract = pickDistractors(correct, 3, "en");
      const options = shuffle([correct, ...distract]);
      return {
        type: "mcq",
        direction: "ms-to-en",
        prompt: `What does “${pair.ms}” mean?`,
        answer: correct,
        options,
      };
    }
  }

  function buildQuizQuestions(mode) {
    // ensure variety
    const qs = [];
    for (let i = 0; i < QUIZ_LEN; i++) {
      qs.push(buildQuestion(mode));
    }
    return qs;
  }

  /* ---------- Rendering ---------- */
  function render() {
    if (!quizArea) return;

    const q = state.questions[state.index];
    if (!q) {
      renderSummary();
      return;
    }

    quizArea.innerHTML = "";
    const card = tplQuizCard ? tplQuizCard.content.firstElementChild.cloneNode(true) : document.createElement("div");

    // top
    card.querySelector("[data-q='n']").textContent = String(state.index + 1);
    card.querySelector("[data-q='t']").textContent = String(QUIZ_LEN);
    card.querySelector("[data-q='prompt']").textContent = q.prompt;

    // typing mode
    const answersEl = card.querySelector("[data-q='answers']");
    const typingEl = card.querySelector("[data-q='typing']");
    const feedbackEl = card.querySelector("[data-q='feedback']");

    answersEl.innerHTML = "";

    if (q.type === "typing") {
      typingEl.hidden = false;
      const input = card.querySelector("#typingInput");
      input.value = "";
      input.focus?.();

      const submit = card.querySelector("[data-action='submit-typing']");
      submit.addEventListener("click", () => submitTyping(card, q));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitTyping(card, q);
      });
    } else {
      typingEl.hidden = true;
      for (const opt of q.options) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "answer";
        btn.textContent = opt;
        btn.addEventListener("click", () => chooseOption(btn, answersEl, feedbackEl, q, opt));
        answersEl.appendChild(btn);
      }
    }

    // footer actions
    card.querySelector("[data-action='skip']").addEventListener("click", () => {
      if (feedbackEl) feedbackEl.textContent = "Skipped 😅";
      nextQuestion();
    });
    card.querySelector("[data-action='next-q']").addEventListener("click", () => nextQuestion());

    quizArea.appendChild(card);
  }

  function chooseOption(btn, answersEl, feedbackEl, q, picked) {
    if (state.answered) return;
    state.answered = true;

    const correct = normalize(picked) === normalize(q.answer);
    if (correct) {
      btn.classList.add("is-correct");
      state.score += 1;
      feedbackEl.textContent = "✅ Betul! (Correct)";
      playSound("good");
      UI?.toast?.("🎉 Correct! +1");
    } else {
      btn.classList.add("is-wrong");
      feedbackEl.textContent = `❌ Not quite. Answer: ${q.answer}`;
      playSound("bad");
      UI?.toast?.("😅 Wrong (try again next time)");
      // highlight correct
      $$(".answer", answersEl).forEach(b => {
        if (normalize(b.textContent) === normalize(q.answer)) b.classList.add("is-correct");
      });
    }

    // disable all
    $$(".answer", answersEl).forEach(b => b.disabled = true);
  }

  function submitTyping(card, q) {
    if (state.answered) return;
    const input = card.querySelector("#typingInput");
    const feedbackEl = card.querySelector("[data-q='feedback']");
    const picked = normalize(input.value);

    state.answered = true;

    const correct = picked === normalize(q.answer);
    if (correct) {
      state.score += 1;
      feedbackEl.textContent = "✅ Betul! (Correct)";
      playSound("good");
      UI?.toast?.("🎉 Correct! +1");
    } else {
      feedbackEl.textContent = `❌ Not quite. Answer: ${q.displayAnswer}`;
      playSound("bad");
      UI?.toast?.("😅 Wrong");
    }

    input.disabled = true;
    card.querySelector("[data-action='submit-typing']").disabled = true;
  }

  function renderSummary() {
    quizArea.innerHTML = "";
    const box = document.createElement("div");
    box.className = "card";
    const pct = Math.round((state.score / QUIZ_LEN) * 100);

    box.innerHTML = `
      <h3 class="card__title">🏁 Quiz complete!</h3>
      <p class="card__text">
        Score: <b>${state.score} / ${QUIZ_LEN}</b> (${pct}%)
      </p>
      <div class="grid grid--2" style="margin-top:12px">
        <div class="stat">
          <div class="stat__k">🍬 XP earned</div>
          <div class="stat__v">${state.score} XP</div>
        </div>
        <div class="stat">
          <div class="stat__k">🏆 Best</div>
          <div class="stat__v">${Store.getState().quiz?.bestScore ?? "—"} / ${QUIZ_LEN}</div>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px">
        <button class="btn btn--primary" type="button" data-action="quiz-restart">🔁 Play again</button>
        <button class="btn" type="button" data-action="quiz-lessons">📚 Back to lessons</button>
      </div>
    `;

    box.querySelector("[data-action='quiz-restart']").addEventListener("click", () => start());
    box.querySelector("[data-action='quiz-lessons']").addEventListener("click", () => {
      UI?.showView?.("lessons");
      UI?.renderLessons?.();
    });

    quizArea.appendChild(box);

    // record score + update top stats
    Store.recordQuizScore(state.score);
    UI?.updateTopStats?.();
  }

  /* ---------- Flow ---------- */
  function start() {
    state.mode = $("#quizMode")?.value || "mixed";
    state.questions = buildQuizQuestions(state.mode);
    state.index = 0;
    state.score = 0;
    state.answered = false;

    render();
    UI?.toast?.("🧠 Quiz started!");
  }

  function nextQuestion() {
    state.index += 1;
    state.answered = false;
    render();
  }

  /* ---------- Bind UI ---------- */
  function bind() {
    // Start quiz button in header
    document.addEventListener("click", (e) => {
      const btn = e.target.closest?.("[data-action='start-quiz']");
      if (btn) start();
    });

    // sync sound setting with storage
    const toggle = $("#quizAudioToggle");
    if (toggle) {
      toggle.checked = !!Store.getState().settings?.sound;
      toggle.addEventListener("change", () => {
        Store.setSetting("sound", !!toggle.checked);
        UI?.toast?.(toggle.checked ? "🔊 Sound ON" : "🔇 Sound OFF");
      });
    }
  }

  /* ---------- Public API ---------- */
  window.MalayQuiz = {
    start,
    nextQuestion,
    buildQuizQuestions,
  };

  window.addEventListener("DOMContentLoaded", bind);
})();
