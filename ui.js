/* =========================================================
   ui.js — Rendering + navigation + progress UI
   Depends on:
     - data.js (window.MALAY_COURSE_DATA)
     - storage.js (window.MalayStorage)
   ========================================================= */

(function () {
  const DATA = window.MALAY_COURSE_DATA;
  const Store = window.MalayStorage;

  if (!DATA || !Store) {
    console.error("Missing MALAY_COURSE_DATA or MalayStorage. Ensure script order is correct.");
    return;
  }

  /* ---------- DOM helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  /* ---------- View navigation ---------- */
  const viewEls = $$("[data-view]");
  function showView(name) {
    for (const v of viewEls) {
      v.classList.toggle("view--active", v.getAttribute("data-view") === name);
    }
    // update aria-current on nav pills
    $$("[data-action^='open-']").forEach(btn => btn.removeAttribute("aria-current"));
    const navMap = {
      home: "open-home",
      lessons: "open-lessons",
      quiz: "open-quiz",
      game: "open-game",
      settings: "open-settings",
    };
    const action = navMap[name];
    const activeBtn = action ? $(`[data-action="${action}"]`) : null;
    if (activeBtn) activeBtn.setAttribute("aria-current", "page");

    // focus main region for accessibility
    const app = $("#app");
    if (app) app.focus({ preventScroll: true });

    // stash current view
    window.MalayUI._currentView = name;
  }

  /* ---------- Progress + stats ---------- */
  function updateTopStats() {
    const st = Store.getState();
    const learned = Store.completedCount();
    const total = DATA.lessonCount;

    setText($("#learnedText"), `${learned} / ${total}`);
    setText($("#xpChip"), `🍬 ${st.xp || 0} XP`);
    setText($("#streakChip"), `🔥 ${st.streak || 0}`);

    // quiz best
    const best = st.quiz?.bestScore;
    setText($("#quizBestText"), best == null ? "Best: —" : `Best: ${best}/10`);

    // progress bar %
    const pct = total ? Math.round((learned / total) * 100) : 0;
    setText($("#progressText"), `${pct}% complete`);
    const fill = $("#progressFill");
    if (fill) fill.style.width = `${pct}%`;

    const pb = $(".progress__bar");
    if (pb) pb.setAttribute("aria-valuenow", String(pct));

    // goal (cute placeholder)
    setText($("#goalText"), "5 minutes");
  }

  /* ---------- Lessons rendering ---------- */
  const lessonListEl = $("#lessonList");
  const tplLessonCard = $("#tplLessonCard");

  function lessonMatchesQuery(lesson, q) {
    if (!q) return true;
    const hay = [
      lesson.title,
      ...(lesson.keywords || []).map(k => `${k.ms} ${k.en}`),
      ...(lesson.examples || []).map(ex => `${ex.ms} ${ex.en}`)
    ].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function lessonMatchesFilter(lesson, filterVal) {
    if (!filterVal || filterVal === "all") return true;
    return (lesson.tags || []).includes(filterVal);
  }

  function renderLessons() {
    if (!lessonListEl || !tplLessonCard) return;

    lessonListEl.innerHTML = "";

    const q = ($("#lessonSearch")?.value || "").trim();
    const filterVal = $("#lessonFilter")?.value || "all";

    const lessons = DATA.lessons
      .slice()
      .sort((a, b) => (a.n || 0) - (b.n || 0))
      .filter(l => lessonMatchesQuery(l, q))
      .filter(l => lessonMatchesFilter(l, filterVal));

    if (!lessons.length) {
      const p = document.createElement("p");
      p.className = "notice";
      p.textContent = "No lessons found. Try a different search 💗";
      lessonListEl.appendChild(p);
      return;
    }

    for (const lesson of lessons) {
      const node = tplLessonCard.content.firstElementChild.cloneNode(true);

      // top bits
      $(".lessoncard__emoji", node).textContent = lesson.emoji || "💗";
      $(".lessoncard__title", node).textContent = `${lesson.n}️⃣ ${lesson.title}`;
      const tagsWrap = $(".lessoncard__tags", node);
      tagsWrap.innerHTML = (lesson.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("");

      const statusEl = $(".lessoncard__status", node);
      const done = Store.isLessonDone(lesson.id);
      statusEl.textContent = done ? "✅" : "⬜️";

      // keywords
      const kvList = $(".kv__list", node);
      kvList.innerHTML = (lesson.keywords || []).map(k => {
        return `<div class="kv__row"><dt>${esc(k.en)}</dt><dd>${esc(k.ms)}</dd></div>`;
      }).join("");

      // examples
      const exList = $(".ex__list", node);
      exList.innerHTML = (lesson.examples || []).map(ex => `<li><b>${esc(ex.ms)}</b> — ${esc(ex.en)}</li>`).join("");

      // back side text
      const hintP = $(".kv__hint", node);
      hintP.textContent = lesson.hint || "Say each example out loud 3x ✨";

      // attach lesson id
      node.dataset.lessonId = lesson.id;

      // click-to-flip (but ignore footer button clicks)
      node.addEventListener("click", (e) => {
        const target = e.target;
        if (target && target.closest && target.closest("[data-action]")) return;
        node.classList.toggle("is-flipped");
      });

      // keyboard toggle
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          node.classList.toggle("is-flipped");
        }
      });

      // Practice button
      const practiceBtn = $(`[data-action="open-practice"]`, node);
      if (practiceBtn) {
        practiceBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openPracticeForLesson(lesson.id);
        });
      }

      // Mark done button
      const doneBtn = $(`[data-action="mark-done"]`, node);
      if (doneBtn) {
        doneBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          Store.markLessonDone(lesson.id);
          statusEl.textContent = "✅";
          updateTopStats();
          toast(`✅ Marked done: ${lesson.title} (+10 XP)`);
        });
      }

      lessonListEl.appendChild(node);
    }
  }

  /* ---------- Practice area ---------- */
  const practiceAreaEl = $("#practiceArea");

  function openPracticeForLesson(lessonId) {
    const lesson = DATA.lessons.find(l => l.id === lessonId);
    if (!lesson || !practiceAreaEl) return;

    // Store current lesson for "Quick practice" button
    window.MalayUI._lastLessonId = lessonId;

    // Generate a simple practice (MCQ from keywords)
    const kw = (lesson.keywords || []).filter(k => k.ms && k.en);
    const base = kw[Math.floor(Math.random() * kw.length)] || null;

    practiceAreaEl.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "qcard";

    const title = document.createElement("h3");
    title.className = "qcard__q";
    title.textContent = `🧪 Practice: ${lesson.title}`;
    wrap.appendChild(title);

    if (!base) {
      const p = document.createElement("p");
      p.textContent = "No practice available for this topic yet.";
      wrap.appendChild(p);
      practiceAreaEl.appendChild(wrap);
      return;
    }

    const prompt = document.createElement("p");
    prompt.style.margin = "0 0 12px";
    prompt.innerHTML = `What is <b>${esc(base.en)}</b> in Malay?`;
    wrap.appendChild(prompt);

    const answers = document.createElement("div");
    answers.className = "qcard__answers";

    const options = buildOptionsFromKeywords(base.ms, lessonId, 4);
    for (const opt of options) {
      const btn = document.createElement("button");
      btn.className = "answer";
      btn.type = "button";
      btn.textContent = opt;

      btn.addEventListener("click", () => {
        const correct = opt === base.ms;
        if (correct) {
          btn.classList.add("is-correct");
          Store.addXP(3);
          updateTopStats();
          toast("🎉 Betul! (+3 XP)");
        } else {
          btn.classList.add("is-wrong");
          toast(`😅 Almost! Answer: ${base.ms}`);
        }
        // disable all
        $$(".answer", answers).forEach(b => (b.disabled = true));
      });

      answers.appendChild(btn);
    }
    wrap.appendChild(answers);

    const footer = document.createElement("div");
    footer.className = "qcard__footer";
    footer.innerHTML = `<div class="qcard__feedback">Tip: say it out loud 3x 💕</div>
      <div class="qcard__actions">
        <button class="btn btn--soft" type="button" data-action="practice-again">Again 🔁</button>
        <button class="btn" type="button" data-action="practice-next">Next topic →</button>
      </div>`;
    wrap.appendChild(footer);

    practiceAreaEl.appendChild(wrap);

    // footer actions
    const again = $(`[data-action="practice-again"]`, footer);
    const next = $(`[data-action="practice-next"]`, footer);
    again?.addEventListener("click", () => openPracticeForLesson(lessonId));
    next?.addEventListener("click", () => {
      const nextLesson = nextLessonByNumber(lesson);
      if (nextLesson) openPracticeForLesson(nextLesson.id);
    });

    // scroll into view nicely
    wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function nextLessonByNumber(current) {
    const sorted = DATA.lessons.slice().sort((a, b) => (a.n || 0) - (b.n || 0));
    const idx = sorted.findIndex(l => l.id === current.id);
    return idx >= 0 ? (sorted[idx + 1] || sorted[0]) : sorted[0];
  }

  function buildOptionsFromKeywords(correctMs, lessonId, n = 4) {
    const pool = [];
    for (const l of DATA.lessons) {
      for (const k of (l.keywords || [])) {
        if (k.ms) pool.push(k.ms);
      }
    }
    // unique
    const uniq = Array.from(new Set(pool)).filter(Boolean);

    // remove exact duplicate of correct first, we'll add later
    const others = uniq.filter(x => x !== correctMs);

    // pick random
    const opts = [correctMs];
    while (opts.length < n && others.length) {
      const idx = Math.floor(Math.random() * others.length);
      opts.push(others.splice(idx, 1)[0]);
    }
    return shuffle(opts);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(message) {
    let t = $("#_toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "_toast";
      t.style.position = "fixed";
      t.style.left = "50%";
      t.style.bottom = "92px";
      t.style.transform = "translateX(-50%)";
      t.style.padding = "12px 14px";
      t.style.borderRadius = "16px";
      t.style.border = "1px solid rgba(255,79,168,.18)";
      t.style.background = "rgba(255,255,255,.86)";
      t.style.boxShadow = "0 18px 44px rgba(255,79,168,.16)";
      t.style.fontWeight = "900";
      t.style.zIndex = "9999";
      t.style.maxWidth = "min(560px, 92vw)";
      t.style.textAlign = "center";
      t.style.opacity = "0";
      t.style.transition = "opacity .15s ease, transform .15s ease";
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(-2px)";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(6px)";
    }, 1400);
  }

  /* ---------- Sparkles ---------- */
  function spark(x, y) {
    const st = Store.getState();
    if (!st.settings?.sparkles) return;

    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }

  function bindSparkles() {
    document.addEventListener("pointerdown", (e) => {
      // only show sparkles for primary clicks/taps
      if (e.button != null && e.button !== 0) return;
      spark(e.clientX, e.clientY);
    }, { passive: true });
  }

  /* ---------- Bind events ---------- */
  function bindLessonTools() {
    $("#lessonSearch")?.addEventListener("input", renderLessons);
    $("#lessonFilter")?.addEventListener("change", renderLessons);

    // random lesson button
    const rnd = $(`[data-action="random-lesson"]`);
    rnd?.addEventListener("click", () => {
      const lesson = DATA.lessons[Math.floor(Math.random() * DATA.lessons.length)];
      showView("lessons");
      renderLessons();
      // open practice automatically
      openPracticeForLesson(lesson.id);
      toast(`🎲 Random: ${lesson.title}`);
    });
  }

  function bindNavActions() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest?.("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");

      // navigation
      if (action === "open-home") showView("home");
      if (action === "open-lessons") { showView("lessons"); renderLessons(); }
      if (action === "open-quiz") showView("quiz");
      if (action === "open-game") showView("game");
      if (action === "open-settings") showView("settings");

      // home actions
      if (action === "start-course") { showView("lessons"); renderLessons(); toast("🌸 Let’s go!"); }
      if (action === "continue-course") {
        const last = window.MalayUI._lastLessonId;
        showView("lessons");
        renderLessons();
        if (last) openPracticeForLesson(last);
        else toast("✨ Pick any lesson to continue!");
      }

      // settings
      if (action === "toggle-sparkles") {
        const on = Store.toggleSetting("sparkles");
        document.body.classList.toggle("sparkles-off", !on);
        toast(on ? "✨ Sparkles ON" : "✨ Sparkles OFF");
      }
      if (action === "reset-progress") {
        Store.resetAll();
        updateTopStats();
        renderLessons();
        document.body.classList.remove("sparkles-off");
        toast("🧹 Reset done!");
      }

      // bottom nav
      if (action === "prev") moveTab(-1);
      if (action === "next") moveTab(1);

      if (action === "quick-practice") {
        showView("lessons");
        renderLessons();
        const last = window.MalayUI._lastLessonId;
        if (last) openPracticeForLesson(last);
        else openPracticeForLesson(DATA.lessons[0].id);
      }
    });
  }

  function moveTab(dir) {
    const order = ["home", "lessons", "quiz", "game", "settings"];
    const cur = window.MalayUI._currentView || "home";
    const idx = order.indexOf(cur);
    const nextIdx = idx < 0 ? 0 : (idx + dir + order.length) % order.length;
    const name = order[nextIdx];
    showView(name);
    if (name === "lessons") renderLessons();
  }

  /* ---------- Init ---------- */
  function init() {
    // apply sparkles setting immediately
    const st = Store.getState();
    document.body.classList.toggle("sparkles-off", !st.settings?.sparkles);

    bindNavActions();
    bindLessonTools();
    bindSparkles();

    updateTopStats();
    // initial view (home)
    showView("home");
  }

  // Expose minimal hooks to other modules
  window.MalayUI = {
    showView,
    renderLessons,
    openPracticeForLesson,
    updateTopStats,
    toast,
    _currentView: "home",
    _lastLessonId: null,
  };

  window.addEventListener("DOMContentLoaded", init);
})();
