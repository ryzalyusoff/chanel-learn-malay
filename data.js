/* =========================================================
   data.js — Malay Core Basics (18 Topics)
   Source of truth for lessons / quiz / game.
   Loaded BEFORE app.js.
   ========================================================= */

(function () {
  const lessons = [
    {
      id: "here-there",
      n: 1,
      emoji: "📍",
      title: "Here & There",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "sini", en: "here" },
        { ms: "sana", en: "there" },
        { ms: "mana", en: "where" },
        { ms: "di", en: "at / in" },
      ],
      examples: [
        { ms: "Saya di sini.", en: "I’m here." },
        { ms: "Awak di sana.", en: "You’re there." },
        { ms: "Di mana awak?", en: "Where are you?" },
      ],
      hint: "Try pointing as you speak: sini (here), sana (there)."
    },

    {
      id: "liking",
      n: 2,
      emoji: "💗",
      title: "Liking",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "suka", en: "like" },
        { ms: "sangat", en: "very / really" },
        { ms: "tak", en: "not (casual)" },
        { ms: "tidak", en: "not (more formal)" },
      ],
      examples: [
        { ms: "Saya suka awak.", en: "I like you." },
        { ms: "Saya suka awak sangat.", en: "I really like you." },
        { ms: "Saya tak suka itu.", en: "I don’t like that." },
      ],
      hint: "Casual: tak. Formal: tidak."
    },

    {
      id: "doing",
      n: 3,
      emoji: "🛠️",
      title: "Doing / Making",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "buat", en: "do / make" },
        { ms: "apa", en: "what" },
        { ms: "jangan", en: "don’t" },
      ],
      examples: [
        { ms: "Saya buat ini.", en: "I’m doing this." },
        { ms: "Awak buat apa?", en: "What are you doing?" },
        { ms: "Jangan buat begitu.", en: "Don’t do that." },
      ],
      hint: "buat apa? = what are you doing?"
    },

    {
      id: "can-able",
      n: 4,
      emoji: "💪",
      title: "Can / Able To",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "boleh", en: "can / allowed" },
        { ms: "tak boleh", en: "cannot / not allowed" },
        { ms: "cakap", en: "speak" },
        { ms: "sikit", en: "a little" },
        { ms: "sekarang", en: "now" },
      ],
      examples: [
        { ms: "Saya boleh.", en: "I can." },
        { ms: "Saya boleh cakap Melayu sikit.", en: "I can speak a little Malay." },
        { ms: "Saya tak boleh sekarang.", en: "I can’t right now." },
      ],
      hint: "tak boleh = can’t / not allowed."
    },

    {
      id: "understanding",
      n: 5,
      emoji: "🧠",
      title: "Understanding",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "faham", en: "understand" },
        { ms: "tak faham", en: "don’t understand" },
        { ms: "sikit", en: "a little" },
      ],
      examples: [
        { ms: "Saya faham.", en: "I understand." },
        { ms: "Saya tak faham.", en: "I don’t understand." },
        { ms: "Awak faham?", en: "Do you understand?" },
      ],
      hint: "A super useful pair: faham / tak faham."
    },

    {
      id: "wanting",
      n: 6,
      emoji: "✨",
      title: "Wanting",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "nak", en: "want (casual)" },
        { ms: "mahu", en: "want (more formal)" },
        { ms: "makan", en: "eat" },
        { ms: "minum", en: "drink" },
        { ms: "apa", en: "what" },
      ],
      examples: [
        { ms: "Saya nak awak.", en: "I want you." },
        { ms: "Saya nak makan.", en: "I want to eat." },
        { ms: "Awak nak apa?", en: "What do you want?" },
      ],
      hint: "nak is super common in daily speech."
    },

    {
      id: "getting-giving",
      n: 7,
      emoji: "🎁",
      title: "Getting / Giving",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "ambil", en: "take / get" },
        { ms: "beri", en: "give" },
        { ms: "ini", en: "this" },
        { ms: "itu", en: "that" },
        { ms: "jangan", en: "don’t" },
        { ms: "saya", en: "me / I" },
      ],
      examples: [
        { ms: "Ambil ini.", en: "Take this." },
        { ms: "Beri saya itu.", en: "Give me that." },
        { ms: "Jangan ambil.", en: "Don’t take it." },
      ],
      hint: "Beri saya… = Give me…"
    },

    {
      id: "having",
      n: 8,
      emoji: "👜",
      title: "Having",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "ada", en: "have / exist" },
        { ms: "masa", en: "time" },
        { ms: "duit", en: "money" },
        { ms: "tak ada", en: "don’t have / there isn’t" },
      ],
      examples: [
        { ms: "Saya ada masa.", en: "I have time." },
        { ms: "Awak ada duit?", en: "Do you have money?" },
        { ms: "Saya tak ada.", en: "I don’t have (it)." },
      ],
      hint: "ada also means 'there is/are'."
    },

    {
      id: "ordering-polite",
      n: 9,
      emoji: "🙏",
      title: "Ordering / Polite Requests",
      tags: ["starter", "daily", "travel"],
      keywords: [
        { ms: "tolong", en: "please (help…)" },
        { ms: "boleh", en: "can" },
        { ms: "tunggu", en: "wait" },
        { ms: "sekejap", en: "a moment" },
        { ms: "saya", en: "me / I" },
      ],
      examples: [
        { ms: "Tolong ambil ini.", en: "Please take this." },
        { ms: "Boleh tolong saya?", en: "Can you help me?" },
        { ms: "Tunggu sekejap.", en: "Wait a moment." },
      ],
      hint: "tolong = please/help (very common & polite)."
    },

    {
      id: "greetings",
      n: 10,
      emoji: "👋",
      title: "Greetings (Complete)",
      tags: ["daily", "travel", "starter"],
      keywords: [
        { ms: "selamat pagi", en: "good morning" },
        { ms: "selamat tengah hari", en: "good afternoon (formal)" },
        { ms: "selamat petang", en: "good afternoon / evening" },
        { ms: "selamat malam", en: "good night (greeting/meeting)" },
        { ms: "selamat tidur", en: "good night (sleeping)" },
        { ms: "hai", en: "hi" },
        { ms: "apa khabar", en: "how are you?" },
        { ms: "baik saja", en: "I’m fine" },
        { ms: "awak pula", en: "and you?" },
        { ms: "selamat tinggal", en: "goodbye" },
        { ms: "jumpa lagi", en: "see you again" },
        { ms: "jumpa nanti", en: "see you later" },
        { ms: "jaga diri", en: "take care" },
      ],
      examples: [
        { ms: "Hai! Apa khabar?", en: "Hi! How are you?" },
        { ms: "Baik saja. Awak pula?", en: "I’m fine. And you?" },
        { ms: "Jumpa nanti! Jaga diri.", en: "See you later! Take care." },
      ],
      hint: "Important: selamat malam = greeting; selamat tidur = when someone is going to sleep."
    },

    {
      id: "describing",
      n: 11,
      emoji: "🌸",
      title: "Describing",
      tags: ["daily", "starter"],
      keywords: [
        { ms: "bagus", en: "good / nice" },
        { ms: "tak bagus", en: "not good" },
        { ms: "besar", en: "big" },
        { ms: "kecil", en: "small" },
        { ms: "cantik", en: "beautiful" },
        { ms: "ini", en: "this" },
        { ms: "itu", en: "that" },
        { ms: "awak", en: "you" },
      ],
      examples: [
        { ms: "Ini bagus.", en: "This is good." },
        { ms: "Itu kecil.", en: "That is small." },
        { ms: "Awak cantik.", en: "You’re beautiful." },
      ],
      hint: "Keep it simple: Ini + adjective."
    },

    {
      id: "knowing",
      n: 12,
      emoji: "🧩",
      title: "Knowing (Things & People)",
      tags: ["daily", "starter"],
      keywords: [
        { ms: "tahu", en: "know (a fact)" },
        { ms: "kenal", en: "know (a person)" },
        { ms: "tak tahu", en: "don’t know" },
        { ms: "dia", en: "he / she" },
      ],
      examples: [
        { ms: "Saya tahu.", en: "I know." },
        { ms: "Saya tak tahu.", en: "I don’t know." },
        { ms: "Saya kenal dia.", en: "I know him/her." },
      ],
      hint: "tahu = fact. kenal = person."
    },

    {
      id: "numbering",
      n: 13,
      emoji: "🔢",
      title: "Numbering",
      tags: ["daily", "travel"],
      keywords: [
        { ms: "satu", en: "one" },
        { ms: "dua", en: "two" },
        { ms: "tiga", en: "three" },
        { ms: "banyak", en: "many / a lot" },
        { ms: "sikit", en: "a little" },
        { ms: "saja", en: "only / just" },
        { ms: "kopi", en: "coffee" },
      ],
      examples: [
        { ms: "Satu saja.", en: "Just one." },
        { ms: "Dua kopi.", en: "Two coffees." },
        { ms: "Sikit saja.", en: "Just a little." },
      ],
      hint: "saja = only/just (super useful!)."
    },

    {
      id: "asking",
      n: 14,
      emoji: "❓",
      title: "Asking (Questions)",
      tags: ["starter", "travel", "daily"],
      keywords: [
        { ms: "apa", en: "what" },
        { ms: "siapa", en: "who" },
        { ms: "di mana", en: "where" },
        { ms: "kenapa", en: "why" },
        { ms: "bila", en: "when" },
        { ms: "berapa", en: "how much / many" },
        { ms: "tandas", en: "toilet" },
        { ms: "harga", en: "price" },
      ],
      examples: [
        { ms: "Ini apa?", en: "What is this?" },
        { ms: "Di mana tandas?", en: "Where is the toilet?" },
        { ms: "Berapa harga ini?", en: "How much is this?" },
      ],
      hint: "di mana = where (often written as two words)."
    },

    {
      id: "pronouns",
      n: 15,
      emoji: "🧍‍♀️🧍",
      title: "Pronouns (Very Important)",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "saya", en: "I / me" },
        { ms: "awak", en: "you" },
        { ms: "dia", en: "he / she" },
        { ms: "kita", en: "we (inclusive: you + me)" },
        { ms: "kami", en: "we (exclusive: us, not you)" },
        { ms: "mereka", en: "they" },
      ],
      examples: [
        { ms: "Saya faham.", en: "I understand." },
        { ms: "Awak di sini.", en: "You are here." },
        { ms: "Dia cantik.", en: "She is beautiful." },
        { ms: "Kita pergi sekarang.", en: "Let’s go now." },
        { ms: "Kami sudah makan.", en: "We already ate." },
        { ms: "Mereka datang.", en: "They are coming." },
      ],
      hint: "kita includes the listener; kami excludes the listener."
    },

    {
      id: "movement",
      n: 16,
      emoji: "🧭",
      title: "Movement & Direction",
      tags: ["daily", "travel"],
      keywords: [
        { ms: "pergi", en: "go" },
        { ms: "datang", en: "come" },
        { ms: "masuk", en: "enter" },
        { ms: "keluar", en: "exit / go out" },
        { ms: "balik", en: "return / go back" },
        { ms: "kerja", en: "work" },
        { ms: "dulu", en: "first / earlier (common: “I’ll go first”)"},
        { ms: "bila", en: "when" },
      ],
      examples: [
        { ms: "Saya pergi kerja.", en: "I’m going to work." },
        { ms: "Awak datang bila?", en: "When are you coming?" },
        { ms: "Masuk sini.", en: "Come in here." },
        { ms: "Kita keluar sekarang.", en: "Let’s go out now." },
        { ms: "Saya balik dulu.", en: "I’m going back first." },
      ],
      hint: "balik dulu = I’ll head back first."
    },

    {
      id: "responses",
      n: 17,
      emoji: "✅",
      title: "Responses & Agreement",
      tags: ["starter", "daily"],
      keywords: [
        { ms: "ya", en: "yes" },
        { ms: "tidak", en: "no (formal)" },
        { ms: "tak", en: "no / not (casual)" },
        { ms: "ok", en: "okay" },
        { ms: "baik", en: "fine / okay" },
        { ms: "bagus", en: "good / nice" },
        { ms: "setuju", en: "agree" },
        { ms: "sama", en: "same / me too" },
        { ms: "mungkin", en: "maybe" },
        { ms: "tentu", en: "of course" },
        { ms: "tak apa", en: "no problem / it’s fine" },
      ],
      examples: [
        { ms: "Awak suka ini? — Suka.", en: "Do you like this? — I like it." },
        { ms: "Ini bagus? — Bagus.", en: "Is this good? — Good." },
        { ms: "Kita pergi sekarang? — Setuju.", en: "Shall we go now? — Agree." },
        { ms: "Ok, boleh.", en: "Okay, can." },
        { ms: "Tak apa.", en: "It’s fine / no problem." },
      ],
      hint: "tak apa is a magical phrase for calming things down."
    },

    {
      id: "connectors",
      n: 18,
      emoji: "🔗",
      title: "Connectors & Reasons",
      tags: ["connectors", "daily"],
      keywords: [
        { ms: "dengan", en: "with" },
        { ms: "dan", en: "and" },
        { ms: "kerana", en: "because" },
        { ms: "sebab", en: "because / reason" },
        { ms: "tapi", en: "but" },
        { ms: "jadi", en: "so / therefore" },
        { ms: "juga", en: "also / too" },
        { ms: "lapar", en: "hungry" },
        { ms: "belum", en: "not yet" },
        { ms: "penat", en: "tired" },
        { ms: "hujan", en: "rain" },
        { ms: "duduk", en: "sit / stay" },
      ],
      examples: [
        { ms: "Saya pergi dengan awak.", en: "I’m going with you." },
        { ms: "Saya suka kopi dan teh.", en: "I like coffee and tea." },
        { ms: "Saya lapar kerana belum makan.", en: "I’m hungry because I haven’t eaten." },
        { ms: "Saya tak datang sebab kerja.", en: "I didn’t come because of work." },
        { ms: "Saya nak pergi tapi penat.", en: "I want to go but I’m tired." },
        { ms: "Hujan, jadi kita duduk sini.", en: "It’s raining, so we stay here." },
        { ms: "Saya suka awak juga.", en: "I like you too." },
      ],
      hint: "kerana & sebab both mean “because”. sebab is super common in speech."
    },
  ];

  // Build a pool of simple phrase pairs for quiz/game.
  // Includes keywords and examples.
  const phrasePairs = [];
  for (const lesson of lessons) {
    for (const k of lesson.keywords) phrasePairs.push({ ms: k.ms, en: k.en, lessonId: lesson.id });
    for (const ex of lesson.examples) phrasePairs.push({ ms: ex.ms, en: ex.en, lessonId: lesson.id });
  }

  // Deduplicate pairs by ms+en
  const seen = new Set();
  const uniqPairs = phrasePairs.filter(p => {
    const key = (p.ms || "").trim().toLowerCase() + "||" + (p.en || "").trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  window.MALAY_COURSE_DATA = {
    version: "1.0.0",
    title: "🇲🇾 Malay Core Basics — UPDATED MASTER LIST",
    lessonCount: lessons.length,
    lessons,
    phrasePairs: uniqPairs,
  };
})();
