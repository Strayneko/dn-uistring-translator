## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter, mcp, vitest

---

## Project: XML String Translator

A SvelteKit web app that translates Chinese CDATA strings inside XML files to English. Supports multiple translation providers. Built with a dark blue theme.

### What it does
1. User selects a folder via `webkitdirectory` file input (or drag-and-drop)
2. A custom themed confirmation modal appears showing folder path + XML file count
3. On confirm: scans and validates XML files, then translates them sequentially
4. Each file's CDATA sections are extracted; HTML tags inside CDATA are protected with `<x id="N"/>` placeholders before sending to the provider, then restored after
5. Per-file progress bar shows "X / Y strings" during translation
6. Pause / Resume and Stop buttons appear in the progress bar during translation; stopping early still allows ZIP download
7. After all files complete (or after stop), a "Download ZIP" button appears — downloads all translated XMLs as `<folderName>.zip`
8. File list is scrollable (`max-h-104`) with a custom dark blue themed scrollbar

### Source layout

```
src/
├── lib/
│   ├── assets/
│   │   ├── favicon.svg
│   │   └── app.css                       — Tailwind entry + all @theme color tokens (single source of truth)
│   ├── types.ts                          — XmlFile, TranslationItem, FileStatus (client)
│   ├── utils/
│   │   ├── xml.ts                        — isValidXml, extractCdata, substituteCdata, protectTags, restoreTags
│   │   └── xml.test.ts                   — 33 vitest tests covering the full translation pipeline
│   ├── state/
│   │   └── appState.svelte.ts            — AppState class: all $state/$derived + updateFile + settings
│   ├── handlers/
│   │   ├── folderHandler.ts              — handleFolderSelect, handleCancel
│   │   ├── translateHandler.ts           — handleConfirm (scan → batch → substitute); pause/stop support
│   │   ├── downloadHandler.ts            — handleDownload (zip + browser save)
│   │   └── settingsHandler.ts            — handleOpenSettings, handleSaveSettings (validates key via API before saving)
│   ├── components/
│   │   ├── ConfirmDialog.svelte          — confirmation modal (props: show, folderName, fileCount, onConfirm, onCancel)
│   │   ├── FolderSelector.svelte         — folder browse + drag-and-drop (props: folderPath, onSelect)
│   │   ├── FileList.svelte               — file list + overall progress + pause/stop buttons + download button
│   │   ├── FileRow.svelte                — single file row with per-file progress bar
│   │   └── SettingsModal.svelte          — provider + API key modal; unclosable on first run, spinner + error on save
│   └── server/
│       └── translate/
│           ├── types.ts                  — TranslationProvider interface, TranslationItem (server)
│           ├── index.ts                  — getProvider(provider, apiKey, baseUrl?) routes to correct provider
│           ├── retry.ts                  — withRetry() — exponential backoff + jitter on 429/503
│           ├── google.ts                 — Google Translate v2 REST, batched at 100, format: html
│           ├── googleFree.ts             — @vitalets/google-translate-api, sequential per-item
│           ├── deepl.ts                  — DeepL v2 REST, batched at 50, tag_handling: html
│           └── libretranslate.ts         — LibreTranslate REST, sequential per-item, format: html; optional API key
└── (no database or server env vars — fully client-driven)
└── routes/
    ├── +layout.svelte                    — imports app.css, sets <title>UI String Translator</title>
    ├── +page.svelte                      — state wiring only (new AppState + handler factories)
    └── api/translate/
        └── +server.ts                    — POST endpoint; protects/restores HTML tags; calls getProvider
```

### Architecture

**`+page.svelte`** is a pure orchestrator — no logic, only wiring:
```ts
const state = new AppState();
const { handleFolderSelect, handleCancel } = createFolderHandlers(state);
const { handleConfirm } = createTranslateHandler(state);
const { handleDownload } = createDownloadHandler(state);
const { handleOpenSettings, handleSaveSettings } = createSettingsHandlers(state);
```

**`AppState`** (`src/lib/state/appState.svelte.ts`) — Svelte 5 reactive class holding:
- `$state`: `folderPath`, `xmlFiles`, `translating`, `paused`, `stopped`, `fileMap`, `translatedContents`, `provider`, `apiKey`, `libretranslateUrl`, `showSettings`, dialog state
- `$derived`: `isConfigured`, `doneCount`, `errorCount`, `totalCount`, `overallProgress`, `allDone`, `hasSuccessful`, `canDownload`, `zipFolderName`
- Methods: `updateFile(name, patch)`, `init()`, `saveSettings(provider, apiKey, libretranslateUrl?)`

**Settings flow**:
- On first load (`init()`): if no key and provider requires one → `showSettings = true` with `canClose = false`
- Keyless providers (`google-free`, `libretranslate`) never force the modal open
- Header button opens settings with `canClose = true`
- On save: `handleSaveSettings` validates the key via a test request (skipped for keyless providers or libretranslate with no key); only persists if valid
- `SettingsModal` shows spinner + "Validating…" during check; red error banner if rejected

**Translation** — four providers:
- `google-free`: unofficial free endpoint, no key, sequential per-item via `@vitalets/google-translate-api`
- `google`: Google Translate v2 REST, batches 100 items, requires API key, `format: 'html'`
- `deepl`: DeepL v2 REST, batches 50 items, requires API key, `tag_handling: 'html'`; auto-detects free/paid endpoint from `:fx` suffix
- `libretranslate`: LibreTranslate REST, sequential per-item, optional API key, configurable base URL, `format: 'html'`
- `google` and `deepl` use `withRetry()` — up to 4 attempts with exponential backoff + jitter on 429/503
- `getProvider(provider, apiKey, baseUrl?)` in `index.ts` routes to the correct class

**HTML tag protection** (in `+server.ts`):
- Before translation: `protectTags(text)` replaces every `<...>` tag with `<x id="N"/>` placeholders
- Provider translates with HTML mode — translator skips `<x>` elements, translates only surrounding text
- After translation: `restoreTags(text, tags)` restores exact original tags; a cleanup pass strips any mangled `<x ...>` fragments the translator garbled

**Pause / Stop** (in `translateHandler.ts`):
- `state.paused` / `state.stopped` flags set from `FileList` buttons
- Translate loop polls every 100 ms while paused; breaks on stop
- A file interrupted mid-batch is reverted to `pending`; `state.canDownload` becomes true immediately on stop if any file succeeded

**API endpoint**: `POST /api/translate`
- Accepts `{ items, filename, apiKey, provider, baseUrl? }`
- Returns `{ items: TranslationItem[] }`
- `TranslationItem = { id: number, text: string }`

**File list header** shows three live counters:
- `X translated` (green) — files with `status === 'done'`
- `X error(s)` (red) — only shown when `errorCount > 0`
- `X total` (grey) — all validated files

### Key env vars
None required. `.env` and `.env.example` are intentionally empty — all API keys come from the user's browser localStorage.

### Commit conventions
- Simple, descriptive messages — `feat:`, `fix:`, `chore:`, `refactor:`
- One commit per file or logical group
- No co-author attribution
- Update CLAUDE.md after each commit session

### Current state
- All core features complete and working
- Four translation providers: Google Translate (Free), Google Translate (API Key), DeepL, LibreTranslate
- Pause/Resume and Stop buttons during translation; early stop still allows ZIP download
- Rate-limit retry with exponential backoff for Google (paid) and DeepL
- HTML tags inside CDATA preserved via `<x id="N"/>` placeholder pattern + HTML format mode
- 33 vitest server-side tests covering XML utilities and full translation pipeline
- Per-user settings stored in localStorage; validated on save; resets API key when provider is switched
- Settings modal: unclosable on first run, reopenable via header button
- Folder selector supports click-to-browse and drag-and-drop
- No database, no server env vars — fully client-driven
- All theme colors centralized in `src/lib/assets/app.css` as Tailwind v4 `@theme` tokens
- No pending tasks

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
