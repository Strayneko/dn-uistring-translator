# UI String Translator

A SvelteKit web app that translates Chinese CDATA strings inside XML files to English. Supports multiple translation providers. Built with a dark blue theme.

---

## Features

- Select a folder via file browser or drag-and-drop
- Scans and validates all XML files in the selected folder
- Extracts CDATA sections and translates them in batches
- Per-file progress bar showing live translation count
- **Pause / Resume** and **Stop** buttons during translation
- Download all translated files as a ZIP archive (available after stop or completion)
- Four translation providers — see table below
- Retries on rate-limit errors (429/503) with exponential backoff
- HTML tags inside CDATA are preserved exactly through the translation pipeline
- API keys are stored only in your browser — never sent to or stored on any server

---

## Translation Providers

| Provider | API Key | Notes |
|---|---|---|
| **Google Translate (Free)** | Not required | Uses Google's public endpoint. No account needed. May be rate-limited on large files. |
| **Google Translate (API Key)** | Required | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |
| **DeepL** | Required | [DeepL API](https://www.deepl.com/pro-api) — free or paid plan. Free keys end with `:fx`. |
| **LibreTranslate** | Optional | Self-hostable open-source engine. Public instance at `https://libretranslate.com/translate`. Restricted instances require a key. |

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Install

```bash
git clone https://github.com/Strayneko/dn-uistring-translator.git
cd dn-uistring-translator
npm install
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

### Run tests

```bash
npx vitest run
```

---

## Usage

### 1. Set up your provider

On first launch a **Settings** modal will appear. Choose a provider:

- **Google Translate (Free)** — no key needed, just click Save.
- **Google Translate (API Key)** / **DeepL** — paste your API key and click Save. The key is validated immediately; an error is shown if it is rejected.
- **LibreTranslate** — enter the API endpoint URL (default: `https://libretranslate.com/translate`). The API key is optional; fill it in only if your instance requires one, and it will be validated before saving.

> Your key is saved only in your browser's local storage. It is never sent to or stored on any server beyond the translation provider itself.

You can update your provider or key at any time via the **Settings** button in the top-right corner.

### 2. Select a folder

Click **Browse** to open a folder picker, or drag and drop a folder onto the input area. The app will count the XML files found and ask you to confirm before starting.

### 3. Translate

Click **Confirm** in the dialog. Each XML file is processed sequentially:

- CDATA strings are extracted and sent to the translation API in batches
- A progress bar on each file row shows how many strings have been translated
- Files that fail show a red error message with the reason
- Use the **Pause** button to suspend between batches; click **Resume** to continue
- Use the **Stop** button to end the session early — successfully translated files are still available for download

### 4. Download

Once all files are processed (or after stopping early) a **Download ZIP** button appears. Click it to download a ZIP archive named after your selected folder, containing all successfully translated XML files.

---

## Tech stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [JSZip](https://stuk.github.io/jszip/) — client-side ZIP generation
- [@vitalets/google-translate-api](https://github.com/vitalets/google-translate-api) — free Google Translate provider
- [Vitest](https://vitest.dev/) — unit tests
