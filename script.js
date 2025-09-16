/**
 * Language Translator App Logic
 * - Populates language list (50+)
 * - Uses MyMemory API for translations
 * - TTS with Web Speech API
 * - Copy/Clear/Swap/Auto-translate/Theme toggle
 * - RTL handling, character counter, toasts
 * - Preferences persisted in localStorage
 */

(function () {
  "use strict";

  // DOM references
  const fromSelect = document.getElementById("from-lang");
  const toSelect = document.getElementById("to-lang");
  const fromText = document.getElementById("from-text");
  const toText = document.getElementById("to-text");
  const translateBtn = document.getElementById("translate-btn");
  const swapBtn = document.getElementById("swap");
  const autoToggle = document.getElementById("auto-translate");
  const charCount = document.getElementById("char-count");
  const statusEl = document.getElementById("status");
  const toastEl = document.getElementById("toast");
  const themeToggle = document.getElementById("theme-toggle");

  // Constants
  const STORAGE_KEYS = {
    theme: "theme",
    fromLang: "fromLang",
    toLang: "toLang",
    auto: "autoTranslate",
  };

  // 50+ languages
  const LANGUAGES = {
    af: "Afrikaans",
    am: "Amharic",
    ar: "Arabic",
    az: "Azerbaijani",
    bg: "Bulgarian",
    bn: "Bengali",
    bs: "Bosnian",
    ca: "Catalan",
    cs: "Czech",
    da: "Danish",
    de: "German",
    el: "Greek",
    en: "English",
    es: "Spanish",
    et: "Estonian",
    fa: "Persian",
    fi: "Finnish",
    fil: "Filipino",
    fr: "French",
    ga: "Irish",
    gl: "Galician",
    gu: "Gujarati",
    he: "Hebrew",
    hi: "Hindi",
    hr: "Croatian",
    hu: "Hungarian",
    hy: "Armenian",
    id: "Indonesian",
    is: "Icelandic",
    it: "Italian",
    ja: "Japanese",
    ka: "Georgian",
    kk: "Kazakh",
    km: "Khmer",
    kn: "Kannada",
    ko: "Korean",
    ky: "Kyrgyz",
    lt: "Lithuanian",
    lv: "Latvian",
    mk: "Macedonian",
    ml: "Malayalam",
    mn: "Mongolian",
    mr: "Marathi",
    ms: "Malay",
    my: "Burmese",
    ne: "Nepali",
    nl: "Dutch",
    no: "Norwegian",
    pa: "Punjabi",
    pl: "Polish",
    ps: "Pashto",
    pt: "Portuguese",
    ro: "Romanian",
    ru: "Russian",
    si: "Sinhala",
    sk: "Slovak",
    sl: "Slovenian",
    sq: "Albanian",
    sr: "Serbian",
    sv: "Swedish",
    sw: "Swahili",
    ta: "Tamil",
    te: "Telugu",
    th: "Thai",
    tl: "Tagalog",
    tr: "Turkish",
    uk: "Ukrainian",
    ur: "Urdu",
    uz: "Uzbek",
    vi: "Vietnamese",
    zh: "Chinese",
    "zh-TW": "Chinese (Traditional)"
  };

  // Right-to-left languages
  const RTL_LANGS = new Set(["ar", "he", "fa", "ur", "ps"]);

  let isTranslating = false;
  let voices = [];
  let lastRequest = { text: "", from: "", to: "" };

  // ------- Utilities -------

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toastEl.classList.remove("show"), 1600);
  }

  function debounce(fn, wait = 500) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function updateCharCount() {
    const max = Number(fromText.getAttribute("maxlength") || 0) || 5000;
    const current = fromText.value.length;
    charCount.textContent = `${current} / ${max}`;
  }

  function applyRTL() {
    const to = toSelect.value;
    const from = fromSelect.value;
    toText.classList.toggle("rtl", RTL_LANGS.has(to));
    fromText.classList.toggle("rtl", RTL_LANGS.has(from));
  }

  function setLoading(state, labelWhenDone = "") {
    isTranslating = state;
    translateBtn.classList.toggle("loading", state);
    translateBtn.disabled = state;
    statusEl.textContent = state ? "Translating…" : labelWhenDone;
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEYS.fromLang, fromSelect.value);
      localStorage.setItem(STORAGE_KEYS.toLang, toSelect.value);
      localStorage.setItem(STORAGE_KEYS.auto, autoToggle.checked ? "1" : "0");
    } catch {}
  }

  function loadPrefs() {
    try {
      const f = localStorage.getItem(STORAGE_KEYS.fromLang);
      const t = localStorage.getItem(STORAGE_KEYS.toLang);
      const a = localStorage.getItem(STORAGE_KEYS.auto);
      if (f && LANGUAGES[f]) fromSelect.value = f;
      if (t && LANGUAGES[t]) toSelect.value = t;
      if (a !== null) autoToggle.checked = a === "1";
    } catch {}
  }

  // Simple in-memory cache for current session
  const memCache = new Map();
  function cacheKey(text, from, to) {
    return `${from}|${to}|${text}`;
  }

  // ------- Language population -------

  function populateLanguages(select, preferred = []) {
    const frag = document.createDocumentFragment();

    const addOption = (code, name) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${name} (${code})`;
      frag.appendChild(opt);
    };

    const seen = new Set();
    if (preferred.length) {
      preferred.forEach(code => {
        if (LANGUAGES[code]) {
          seen.add(code);
          addOption(code, LANGUAGES[code]);
        }
      });

      const divider = document.createElement("option");
      divider.disabled = true;
      divider.textContent = "──────────";
      frag.appendChild(divider);
    }

    Object.entries(LANGUAGES)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([code, name]) => {
        if (seen.has(code)) return;
        addOption(code, name);
      });

    select.innerHTML = "";
    select.appendChild(frag);
  }

  // ------- Theme -------

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme) || "light";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon(saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("ion-icon");
    icon.setAttribute("name", theme === "light" ? "moon-outline" : "sunny-outline");
  }

  // ------- Speech synthesis -------

  function loadVoices() {
    try {
      voices = window.speechSynthesis?.getVoices?.() || [];
    } catch {
      voices = [];
    }
  }
  loadVoices();
  if (typeof window.speechSynthesis !== "undefined") {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text, langCode) {
    if (!text) return;
    if (!("speechSynthesis" in window)) {
      showToast("Speech not supported on this browser.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);

    // Best match by lang prefix (en, en-US, zh, zh-CN, etc.)
    const lc = langCode.toLowerCase();
    let candidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lc));

    // Fallback mapping for some codes
    if (!candidates.length) {
      const fallbackMap = {
        fil: "tl",
        "zh-tw": "zh", // Traditional Chinese may fall back to zh
        no: "nb",
      };
      const fb = fallbackMap[lc];
      if (fb) {
        candidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(fb));
      }
    }

    if (!candidates.length) {
      // Use any voice with same primary language (before dash)
      const primary = lc.split("-")[0];
      candidates = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(primary));
    }

    if (candidates.length) {
      utter.voice = candidates[0];
      utter.lang = candidates[0].lang;
    } else {
      // Fallback to English voice if nothing found
      const en = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en"));
      if (en) {
        utter.voice = en;
        utter.lang = en.lang;
      } else {
        utter.lang = langCode;
      }
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  // ------- Clipboard helpers -------

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  }

  // ------- Translation logic -------

  function bestTranslation(data) {
    // Prefer highest match in matches if available
    if (Array.isArray(data?.matches) && data.matches.length) {
      const sorted = [...data.matches].sort((a, b) => (b.match || 0) - (a.match || 0));
      const best = sorted.find(m => m.translation) || sorted[0];
      if (best?.translation) return best.translation;
    }
    return data?.responseData?.translatedText || "";
  }

  async function translate() {
    const text = fromText.value.trim();
    const from = fromSelect.value;
    const to = toSelect.value;

    if (!text) {
      showToast("Please enter text to translate.");
      return;
    }
    if (from === to) {
      toText.value = text;
      statusEl.textContent = "Same language";
      return;
    }

    // Prevent duplicate in-flight request for the same payload
    const currentKey = cacheKey(text, from, to);
    if (isTranslating && currentKey === cacheKey(lastRequest.text, lastRequest.from, lastRequest.to)) {
      return;
    }
    lastRequest = { text, from, to };

    // Memory cache short-circuit
    if (memCache.has(currentKey)) {
      toText.value = memCache.get(currentKey);
      statusEl.textContent = "Cached";
      return;
    }

    setLoading(true);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });

      if (!res.ok) {
        throw new Error(`Network error ${res.status}`);
      }
      const data = await res.json();

      const out = bestTranslation(data);
      toText.value = out;
      memCache.set(currentKey, out);

      if (data?.responseStatus && data.responseStatus !== 200) {
        // Provide additional context in status for rate-limit or warnings
        statusEl.textContent = data?.responseDetails || `Status ${data.responseStatus}`;
      } else {
        statusEl.textContent = "Done";
      }
    } catch (err) {
      console.error(err);
      showToast("Translation failed. Try again.");
      statusEl.textContent = "Error";
    } finally {
      setLoading(false);
    }
  }

  const debouncedTranslate = debounce(() => {
    if (autoToggle.checked) translate();
  }, 600);

  // ------- Event handlers -------

  translateBtn.addEventListener("click", translate);

  swapBtn.addEventListener("click", () => {
    const fromVal = fromSelect.value;
    const toVal = toSelect.value;
    fromSelect.value = toVal;
    toSelect.value = fromVal;

    // swap texts too
    const fromT = fromText.value;
    const toT = toText.value;
    fromText.value = toT;
    toText.value = fromT;

    updateCharCount();
    applyRTL();
    savePrefs();

    if (autoToggle.checked && fromText.value.trim()) translate();
  });

  // Delegate icon button actions (speak, copy, clear) for both panes
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".icon-btn");
    if (!btn || !btn.dataset.action) return;

    const side = btn.dataset.side; // "from" | "to"
    const action = btn.dataset.action;

    const isFrom = side === "from";
    const area = isFrom ? fromText : toText;
    const lang = isFrom ? fromSelect.value : toSelect.value;

    switch (action) {
      case "speak": {
        const text = area.value.trim();
        if (!text) {
          showToast("Nothing to speak");
          return;
        }
        speak(text, lang);
        break;
      }
      case "copy": {
        const text = area.value;
        if (!text) {
          showToast("Nothing to copy");
          return;
        }
        copyToClipboard(text);
        break;
      }
      case "clear": {
        area.value = "";
        if (isFrom) {
          updateCharCount();
          statusEl.textContent = "";
        }
        break;
      }
      default:
        break;
    }
  });

  // Text input handling
  fromText.addEventListener("input", () => {
    updateCharCount();
    debouncedTranslate();
  });

  // Persist and react on language changes
  fromSelect.addEventListener("change", () => {
    applyRTL();
    savePrefs();
    debouncedTranslate();
  });

  toSelect.addEventListener("change", () => {
    applyRTL();
    savePrefs();
    debouncedTranslate();
  });

  // Auto-translate toggle
  autoToggle.addEventListener("change", () => {
    savePrefs();
    if (autoToggle.checked && fromText.value.trim()) translate();
  });

  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme);

  // Keyboard shortcuts:
  // - Ctrl/Cmd + Enter: translate
  // - Ctrl/Cmd + Shift + S: swap
  document.addEventListener("keydown", (e) => {
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key === "Enter") {
      e.preventDefault();
      translate();
    }
    if (meta && e.shiftKey && (e.key.toLowerCase?.() === "s")) {
      e.preventDefault();
      swapBtn.click();
    }
  });

  // ------- Init sequence -------

  // Populate languages and set defaults
  populateLanguages(fromSelect, ["en", "es", "fr", "de"]);
  populateLanguages(toSelect, ["es", "en", "fr", "de"]);

  // Defaults before loading prefs
  fromSelect.value = "en";
  toSelect.value = "es";

  loadPrefs();
  applyRTL();
  updateCharCount();
  initTheme();
})();