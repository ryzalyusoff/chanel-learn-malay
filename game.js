/* =========================================================
   game.js — Speed Match mini-game
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

  const gameArea = $("#gameArea");
  const tplGame = $("#tplGame");

  let timerId = null;

  const state = {
    running: false,
    timeLeft: 7,
    timePerQ: 7,
    score: 0,
    best: 0,
    current: null, // {ms,en}
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

  function normalize(s) {
    return String(s ?? "").trim().toLowerCase();
  }

  function pairs() {
    return DATA.phrasePairs || [];
  }

  function playSound(type) {
    const st = Store.getState();
    const enabled = st.settings?.sound;
    if (!enabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "triangle";
      o.frequency.value = type === "good" ? 660 : 180;
      g.gain.value = 0.06;
      o.start();
      o.stop(ctx.currentTime + 0.07);
      setTimeout(() => ctx.close(), 120);
    } catch (_) {}
  }

  /* ---------- Best score ---------- */
  function getBest() {
    const st = Store.getState();
    return st.gameBest ?? 0;
  }

  function setBest(v) {
    const st = Store.getState();
    st.gameBest = Math.max(st.gameBest || 0, v);
    Store.save(st);
  }

  /* ---------- Question generation ---------- */
  function pickQuestion() {
    const p = pairs();
    const cur = p[Math.floor(Math.random() * p.length)];
    return { ms: cur.ms, en: cur.en };
  }

  function buildOptions(correctEn, count = 4) {
    const pool = Array.from(new Set(pairs().map(p => p.en).filter(Boolean)));
    const others = pool.filter(x => normalize(x) !== normalize(correctEn));
    const opts = [correctEn];

    while (opts.length < count && others.length) {
      const idx = Math.floor(Math.random() * others.length);
      opts.push(others.splice(idx, 1)[0]);
    }
    return shuffle(opts);
  }

  /* ---------- Rendering ---------- */
  function renderShell() {
    if (!gameArea) return;
    gameArea.innerHTML = "";

    const wrap = tplGame ? tplGame.content.firstElementChild.cloneNode(true) : document.createElement("div");
    gameArea.appendChild(wrap);

    // best
    state.best = getBest();
    $('[data-g="best"]', wrap).textContent = String(state.best);

    // restart button
    wrap.querySelector('[data-action="game-restart"]')?.addEventListener("click", () => start());
  }

  function renderQuestion() {
    const wrap = gameArea?.querySelector(".gwrap");
    if (!wrap) return;

    const q = state.current;
    $('[data-g="ms"]', wrap).textContent = q.ms;
    $('[data-g="score"]', wrap).textContent = String(state.score);
    $('[data-g="best"]', wrap).textContent = String(state.best);

    const ansWrap = $('[data-g="answers"]', wrap);
    ansWrap.innerHTML = "";

    const options = buildOptions(q.en, 4);
    for (const opt of options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer";
      btn.textContent = opt;

      btn.addEventListener("click", () => choose(opt, btn, ansWrap));
      ansWrap.appendChild(btn);
    }
  }

  function renderTime() {
    const wrap = gameArea?.querySelector(".gwrap");
    if (!wrap) return;
    $('[data-g="time"]', wrap).textContent = String(state.timeLeft);
  }

  /* ---------- Game logic ---------- */
  function choose(pickedEn, btn, ansWrap) {
    if (!state.running) return;

    const correct = normalize(pickedEn) === normalize(state.current.en);

    // disable
    $$(".answer", ansWrap).forEach(b => (b.disabled = true));

    if (correct) {
      btn.classList.add("is-correct");
      state.score += 1;
      Store.addXP(2);
      playSound("good");
      UI?.toast?.("⭐ Nice! +2 XP");
      UI?.updateTopStats?.();
      nextRound(true);
    } else {
      btn.classList.add("is-wrong");
      // highlight correct
      $$(".answer", ansWrap).forEach(b => {
        if (normalize(b.textContent) === normalize(state.current.en)) b.classList.add("is-correct");
      });
      playSound("bad");
      end("⏱️ Oops! Wrong answer.");
    }
  }

  function tick() {
    if (!state.running) return;
    state.timeLeft -= 1;
    renderTime();
    if (state.timeLeft <= 0) {
      end("⏱️ Time’s up!");
    }
  }

  function nextRound(fast = false) {
    clearInterval(timerId);

    // tiny pause so user sees feedback
    const delay = fast ? 260 : 500;

    setTimeout(() => {
      if (!state.running) return;
      state.current = pickQuestion();
      state.timeLeft = state.timePerQ;
      renderTime();
      renderQuestion();

      timerId = setInterval(tick, 1000);
    }, delay);
  }

  function start() {
    renderShell();

    // difficulty
    const diff = $("#gameDifficulty")?.value || "normal";
    state.timePerQ = diff === "easy" ? 10 : diff === "hard" ? 5 : 7;

    state.running = true;
    state.score = 0;
    state.best = getBest();
    state.current = pickQuestion();
    state.timeLeft = state.timePerQ;

    renderTime();
    renderQuestion();

    clearInterval(timerId);
    timerId = setInterval(tick, 1000);

    UI?.toast?.("🎮 Game started!");
  }

  function stop() {
    end("Stopped.");
  }

  function end(message) {
    if (!state.running) return;
    state.running = false;
    clearInterval(timerId);

    // best score
    if (state.score > state.best) {
      state.best = state.score;
      setBest(state.best);
      UI?.toast?.("🏆 New best!");
    }

    UI?.updateTopStats?.();

    // show summary in area
    const wrap = gameArea?.querySelector(".gwrap");
    if (!wrap) return;

    const ansWrap = $('[data-g="answers"]', wrap);
    ansWrap.innerHTML = "";

    const box = document.createElement("div");
    box.className = "notice";
    box.style.textAlign = "center";
    box.innerHTML = `
      <div style="font-weight:950; font-size:18px; margin-bottom:6px;">${message}</div>
      <div style="margin-bottom:10px;">Score: <b>${state.score}</b> • Best: <b>${state.best}</b></div>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button class="btn btn--primary" type="button" data-action="g-play">Play again 🔁</button>
        <button class="btn" type="button" data-action="g-lessons">📚 Lessons</button>
      </div>
    `;
    ansWrap.appendChild(box);

    box.querySelector('[data-action="g-play"]')?.addEventListener("click", () => start());
    box.querySelector('[data-action="g-lessons"]')?.addEventListener("click", () => {
      UI?.showView?.("lessons");
      UI?.renderLessons?.();
    });
  }

  /* ---------- Bind buttons ---------- */
  function bind() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("[data-action]");
      if (!a) return;
      const action = a.getAttribute("data-action");
      if (action === "start-game") start();
      if (action === "stop-game") stop();
    });
  }

  window.MalayGame = { start, stop };

  window.addEventListener("DOMContentLoaded", () => {
    // ensure UI exists
    if (gameArea) renderShell();
    bind();
  });
})();
