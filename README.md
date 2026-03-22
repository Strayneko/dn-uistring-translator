# UI String Translator

A SvelteKit web app that translates Chinese CDATA strings inside XML files to English using Google Translate or DeepL. Built with a dark blue theme.

---

## Features

- Select a folder via file browser or drag-and-drop
- Scans and validates all XML files in the selected folder
- Extracts CDATA sections and translates them in batches
- Per-file progress bar showing live translation count
- Download all translated files as a ZIP archive
- Supports **Google Translate** and **DeepL** as translation providers
- API keys are stored only in your browser — never sent to or stored on any server

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Install

```bash
git clone https://github.com/your-username/uistring-translator.git
cd uistring-translator
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

---

## Usage

### 1. Set up your API key

On first launch a **Settings** modal will appear. You must configure a translation provider before using the app.

| Provider | Where to get a key |
|---|---|
| Google Translate | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |
| DeepL | [DeepL API](https://www.deepl.com/pro-api) → free or paid plan |

Select your provider, paste your API key, and click **Save**. The key is validated against the API immediately — if it is rejected an error message is shown and nothing is saved.

> Your key is saved only in your browser's local storage. It is never sent to or stored on any server beyond the translation provider itself.

You can update your provider or key at any time via the **Settings** button in the top-right corner.

### 2. Select a folder

Click **Browse** to open a folder picker, or drag and drop a folder onto the input area. The app will count the XML files found and ask you to confirm before starting.

### 3. Translate

Click **Confirm** in the dialog. Each XML file is processed sequentially:

- CDATA strings are extracted and sent to the translation API in batches
- A progress bar on each file row shows how many strings have been translated
- Files that fail show a red error message with the reason

### 4. Download

Once all files are processed a **Download ZIP** button appears. Click it to download a ZIP archive named after your selected folder, containing all successfully translated XML files.

---

## No environment variables required

There are no `.env` values needed to run this app. All API keys are managed per-user through the Settings modal and stored in the browser.

---

## Tech stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [JSZip](https://stuk.github.io/jszip/) — client-side ZIP generation
- [Vitest](https://vitest.dev/) — unit tests
