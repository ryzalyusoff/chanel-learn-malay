/* =========================================================
   storage.js — Local progress & settings
   - XP 🍬, streak 🔥, completed lessons ✅
   - quiz best score 🏆
   - settings (sparkles, sound)
   ========================================================= */

(function () {
  const KEY = "malay_core_basics_v1";

  const DEFAULT_STATE = {
    version: "1.0.0",
    xp: 0,
    streak: 0,
    lastActiveDay: null, // YYYY-MM-DD
    completedLessons: {}, // { [lessonId]: true }
    quiz: {
      bestScore: null,
      lastScore: null
    },
    settings: {
      sparkles: true,
      sound: true
    }
  };

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(DEFAULT_STATE), ...parsed };
    } catch (e) {
      console.warn("Storage load failed, resetting.", e);
      return structuredClone(DEFAULT_STATE);
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Storage save failed.", e);
    }
  }

  let state = load();

  /* ---------- Streak logic ---------- */
  function touchDay() {
    const today = todayISO();
    if (!state.lastActiveDay) {
      state.lastActiveDay = today;
      state.streak = 1;
      save(state);
      return;
    }
    if (state.lastActiveDay === today) return;

    const prev = new Date(state.lastActiveDay);
    const cur = new Date(today);
    const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
    state.lastActiveDay = today;
    save(state);
  }

  /* ---------- XP ---------- */
  function addXP(amount) {
    state.xp = Math.max(0, (state.xp || 0) + amount);
    touchDay();
    save(state);
  }

  /* ---------- Lessons ---------- */
  function markLessonDone(lessonId) {
    if (!lessonId) return;
    if (!state.completedLessons[lessonId]) {
      state.completedLessons[lessonId] = true;
      addXP(10);
    }
    save(state);
  }

  function isLessonDone(lessonId) {
    return !!state.completedLessons[lessonId];
  }

  function completedCount() {
    return Object.keys(state.completedLessons).length;
  }

  /* ---------- Quiz ---------- */
  function recordQuizScore(score) {
    state.quiz.lastScore = score;
    if (state.quiz.bestScore == null || score > state.quiz.bestScore) {
      state.quiz.bestScore = score;
    }
    addXP(Math.max(0, score));
    save(state);
  }

  /* ---------- Settings ---------- */
  function setSetting(key, value) {
    state.settings[key] = value;
    save(state);
  }

  function toggleSetting(key) {
    state.settings[key] = !state.settings[key];
    save(state);
    return state.settings[key];
  }

  /* ---------- Reset ---------- */
  function resetAll() {
    state = structuredClone(DEFAULT_STATE);
    save(state);
  }

  /* ---------- Public API ---------- */
  window.MalayStorage = {
    getState: () => state,
    save,
    addXP,
    markLessonDone,
    isLessonDone,
    completedCount,
    recordQuizScore,
    setSetting,
    toggleSetting,
    resetAll,
  };
})();
