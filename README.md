# 🌍 Language Translator

Beautiful, responsive, and accessible web-based language translator with 50+ languages, auto-translate, text-to-speech, theme switcher, and more — all in a single static app.

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-HTML%20%7C%20CSS%20%7C%20JS-4361EE?style=for-the-badge" alt="Stack"/>
  <img src="https://img.shields.io/badge/Responsive-Yes-16A34A?style=for-the-badge" alt="Responsive"/>
  <img src="https://img.shields.io/badge/License-MIT-111827?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-10B981?style=for-the-badge" alt="PRs Welcome"/>
</p>

<p align="center">
  <img src="docs/screenshot-light.png" alt="Screenshot - Light theme" width="85%"><br/>
  <em>Light theme — clean, modern UI</em>
</p>

---

## ✨ Features

- 🔤 50+ languages with quick-pick favorites
- 🔁 Swap languages and text instantly
- ⚡ Auto-translate on typing (toggle)
- 🗣️ Text-to-Speech for source and translated text
- 📋 One-click Copy and Clear actions
- 🌓 Theme toggle (Light/Dark) with persistence
- 🔤 Character counter with 5000 char limit
- 🌐 RTL support for Arabic, Hebrew, Persian, Urdu, etc.
- 🔔 Toast notifications for quick feedback
- 💾 Preferences saved in localStorage
- ⌨️ Keyboard shortcuts (Cmd/Ctrl + Enter to translate)

Powered by MyMemory Translation API (free, rate-limited).

---

## 🧩 Tech Stack

- HTML, CSS (no framework, handcrafted UI)
- Vanilla JavaScript (ES6)
- Web Speech API (speech synthesis)
- MyMemory API (translations)
- Ionicons for UI icons

---

## 🚀 Getting Started

1. Clone or download this repository
2. Open `index.html` in your browser
   - Or serve locally for best results:
     - Python: `python3 -m http.server 5173`
     - Node: `npx serve .`
3. Start translating!

No build steps. No API keys required.

---

## 📁 Project Structure

. ├── index.html # App markup ├── style.css # Beautiful, responsive UI styles ├── script.js # App logic (translate, TTS, auto, swap, etc.) └── docs/ └── screenshot-light.png # Optional screenshot for README


---

## 🧠 How It Works

- User enters text and selects source/target languages.
- On click of “Translate it” or when Auto mode is enabled, the app queries:
  - GET https://api.mymemory.translated.net/get?q={text}&langpair={from}|{to}
- Best result is chosen from `matches` or `responseData`.
- TTS uses Web Speech API to read text using the closest matching voice.

---

## 📚 Usage Tips

- Auto Translate: Toggle the “Auto” switch to translate as you type.
- Swap: Click the circular arrows to swap both languages and texts.
- Speak: Use the speaker icon to listen to text (browser support required).
- Copy: One-click copy for either pane using the copy icon.
- Theme: Use the moon/sun icon to switch themes (remembered across sessions).
- RTL: The text areas switch to RTL for supported languages.

---

## ⌨️ Keyboard Shortcuts

- Cmd/Ctrl + Enter → Translate
- Cmd/Ctrl + Shift + S → Swap languages

---

## 🌎 Supported Languages (partial)

Afrikaans (af), Amharic (am), Arabic (ar), Azerbaijani (az), Bengali (bn), Bosnian (bs), Bulgarian (bg), Catalan (ca), Chinese (zh), Chinese (Traditional) (zh-TW), Croatian (hr), Czech (cs), Danish (da), Dutch (nl), English (en), Estonian (et), Filipino (fil), Finnish (fi), French (fr), Galician (gl), Georgian (ka), German (de), Greek (el), Gujarati (gu), Hebrew (he), Hindi (hi), Hungarian (hu), Indonesian (id), Irish (ga), Italian (it), Japanese (ja), Kannada (kn), Kazakh (kk), Khmer (km), Korean (ko), Kyrgyz (ky), Latvian (lv), Lithuanian (lt), Macedonian (mk), Malay (ms), Malayalam (ml), Mongolian (mn), Marathi (mr), Burmese (my), Nepali (ne), Norwegian (no), Pashto (ps), Persian (fa), Polish (pl), Portuguese (pt), Punjabi (pa), Romanian (ro), Russian (ru), Sinhala (si), Slovak (sk), Slovenian (sl), Spanish (es), Swahili (sw), Swedish (sv), Tagalog (tl), Tamil (ta), Telugu (te), Thai (th), Turkish (tr), Ukrainian (uk), Urdu (ur), Uzbek (uz), Vietnamese (vi)

Note: TTS voice availability depends on your browser/OS.

---

## ⚙️ Configuration

- Default languages and quick-picks:
  - Edit `script.js` → `LANGUAGES` constant to add/remove languages.
  - Change initial defaults after population:
    - `fromSelect.value = "en";`
    - `toSelect.value = "es";`
- Auto-translate delay:
  - Adjust `debounce(..., 600)` in `script.js` (milliseconds).
- Character limit:
  - Update `maxlength="5000"` on `#from-text` in `index.html`.

---

## 🧪 Troubleshooting

- “Speech not supported”: Your browser/device may not support Web Speech API.
- Rate-limited or “Error”: MyMemory API may throttle requests. Wait and retry.
- Voices missing: Chrome loads voices asynchronously; try again after a moment.
- RTL issues: Ensure the language code is in the `RTL_LANGS` set in `script.js`.

---

## ☁️ Deploy

- GitHub Pages: Push to `main` and enable Pages on the repo settings.
- Netlify/Vercel: Drag and drop the folder or connect your repo — zero config.
- Any Static Host: Upload the three files — no server code required.

---

## 🔐 Privacy

- No user data is stored remotely by this app.
- Translation requests are sent to MyMemory (third-party) via HTTPS.

---

## 🤝 Contributing

PRs are welcome! Ideas:
- Add more language codes, voice mappings, or offline caching.
- Provide a better fallback when API rate-limits hit.
- Add unit tests for translation parsing logic.

---

## 🙏 Acknowledgements

- Translations by [MyMemory API](https://mymemory.translated.net/doc/spec.php)
- Icons by [Ionicons](https://ionic.io/ionicons)
- Fonts by [Google Fonts](https://fonts.google.com/specimen/Inter)

---

## 📄 License

MIT © Your Name