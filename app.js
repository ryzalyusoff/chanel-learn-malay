/* =========================================================
   app.js — Main entry
   Responsibilities:
   - Sanity checks for module order
   - Provide global event router for data-action buttons (lightweight)
   - Keep home stats/progress fresh when returning to views
   - Small UX niceties

   Script order in index.html MUST be:
     data.js -> storage.js -> ui.js -> quiz.js -> game.js -> app.js
   ========================================================= */

(function () {
  function requireGlobals() {
    const missing = [];
    if (!window.MALAY_COURSE_DATA) missing.push("MALAY_COURSE_DATA (data.js)");
    if (!window.MalayStorage) missing.push("MalayStorage (storage.js)");
    if (!window.MalayUI) missing.push("MalayUI (ui.js)");
    if (!window.MalayQuiz) missing.push("MalayQuiz (quiz.js)");
    if (!window.MalayGame) missing.push("MalayGame (game.js)");
    if (missing.length) {
      console.error("Missing modules:", missing);
      const app = document.querySelector("#app");
      if (app) {
        const warn = document.createElement("div");
        warn.className = "notice";
        warn.style.margin = "18px 0";
        warn.innerHTML = `
          <b>⚠️ JS files not loaded in the right order.</b><br/>
          Missing: ${missing.map(m => `<code>${m}</code>`).join(", ")}<br/>
          Please include script tags in this order:<br/>
          <code>data.js</code>, <code>storage.js</code>, <code>ui.js</code>, <code>quiz.js</code>, <code>game.js</code>, <code>app.js</code>
        `;
        app.prepend(warn);
      }
      return false;
    }
    return true;
  }

  function bindRefreshOnViewSwitch() {
    // When any nav button is clicked, refresh top stats.
    // ui.js handles view switching; we just keep things consistent.
    document.addEventListener("click", (e) => {
      const btn = e.target.closest?.("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const UI = window.MalayUI;

      // after UI updates, refresh stats + lessons if relevant
      if (action && action.startsWith("open-")) {
        setTimeout(() => {
          UI?.updateTopStats?.();
          if (action === "open-lessons") UI?.renderLessons?.();
        }, 0);
      }
    });
  }

  function bindKeyboardShortcuts() {
    // Small shortcuts:
    //  - Ctrl/Cmd + K: focus lesson search if on lessons view
    //  - Esc: go home
    document.addEventListener("keydown", (e) => {
      const UI = window.MalayUI;
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === "k") {
        const cur = UI?._currentView || "home";
        if (cur === "lessons") {
          e.preventDefault();
          const s = document.querySelector("#lessonSearch");
          s?.focus?.();
        }
      }

      if (e.key === "Escape") {
        UI?.showView?.("home");
      }
    });
  }

  function init() {
    if (!requireGlobals()) return;

    // First refresh
    window.MalayUI.updateTopStats();

    // Keep in sync on navigation
    bindRefreshOnViewSwitch();

    // QoL shortcuts
    bindKeyboardShortcuts();

    // Friendly startup toast once
    const st = window.MalayStorage.getState();
    if (!st._welcomed) {
      st._welcomed = true;
      window.MalayStorage.save(st);
      window.MalayUI.toast("💗 Welcome! Tap Lessons to start.");
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
