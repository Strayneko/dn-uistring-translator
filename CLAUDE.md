## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter, drizzle, mcp, vitest

---

## Project: XML String Translator

A SvelteKit web app that translates Chinese CDATA strings inside XML files to English using Google Translate API. Built with a dark blue theme.

### What it does
1. User selects a folder via `webkitdirectory` file input (or drag-and-drop)
2. A custom themed confirmation modal appears showing folder path + XML file count
3. On confirm: scans and validates XML files, then translates them sequentially
4. Each file's CDATA sections are extracted, sent to Google Translate in batches of 100, substituted back
5. Per-file progress bar shows "X / Y strings" during translation
6. After all files complete, a "Download ZIP" button appears — downloads all translated XMLs as `<folderName>.zip`
7. File list is scrollable (`max-h-104`) with a custom dark blue themed scrollbar

### Source layout

```
src/
├── lib/
│   ├── types.ts                          — XmlFile, TranslationItem, FileStatus (client)
│   ├── utils/
│   │   └── xml.ts                        — isValidXml, extractCdata, substituteCdata
│   ├── state/
│   │   └── appState.svelte.ts            — AppState class: all $state/$derived + updateFile + settings
│   ├── handlers/
│   │   ├── folderHandler.ts              — handleFolderSelect, handleCancel
│   │   ├── translateHandler.ts           — handleConfirm (scan → batch → substitute)
│   │   ├── downloadHandler.ts            — handleDownload (zip + browser save)
│   │   └── settingsHandler.ts            — handleOpenSettings, handleSaveSettings (validates key via API before saving)
│   ├── components/
│   │   ├── ConfirmDialog.svelte          — confirmation modal (props: show, folderName, fileCount, onConfirm, onCancel)
│   │   ├── FolderSelector.svelte         — folder browse + drag-and-drop (props: folderPath, onSelect)
│   │   ├── FileList.svelte               — file list container + overall progress + download button
│   │   ├── FileRow.svelte                — single file row with per-file progress bar
│   │   └── SettingsModal.svelte          — API key + provider modal; unclosable on first run, spinner + error on save
│   └── server/
│       └── translate/
│           ├── types.ts                  — TranslationProvider interface, TranslationItem (server)
│           ├── index.ts                  — getProvider(apiKey) returns GoogleTranslateProvider
│           └── google.ts                 — Google Translate v2 REST, batched at 100
└── routes/
    ├── +page.svelte                      — state wiring only (new AppState + 4 handler factories)
    └── api/translate/
        └── +server.ts                    — POST endpoint; reads apiKey from request body, calls getProvider
```

### Architecture

**`+page.svelte`** is a pure orchestrator — ~20 lines of script, no logic:
```ts
const state = new AppState();
const { handleFolderSelect, handleCancel } = createFolderHandlers(state);
const { handleConfirm } = createTranslateHandler(state);
const { handleDownload } = createDownloadHandler(state);
const { handleOpenSettings, handleSaveSettings } = createSettingsHandlers(state);
```

**`AppState`** (`src/lib/state/appState.svelte.ts`) — Svelte 5 reactive class holding:
- `$state`: `folderPath`, `xmlFiles`, `translating`, `fileMap`, `translatedContents`, `provider`, `apiKey`, `showSettings`, dialog state
- `$derived`: `isConfigured`, `doneCount`, `errorCount`, `totalCount`, `overallProgress`, `allDone`, `hasSuccessful`, `zipFolderName`
- Methods: `updateFile(name, patch)`, `init()` (loads from localStorage, opens settings if no key), `saveSettings(provider, apiKey)`

**Settings flow**:
- On first load (`init()`): if no key in localStorage → `showSettings = true` with `canClose = false`
- Header button opens settings with `canClose = true`
- On save: `handleSaveSettings` sends a test request to `/api/translate`; only calls `state.saveSettings()` if the key is valid
- `SettingsModal` shows spinner + "Validating…" during check; red error banner if rejected

**Translation** — Google Translate v2 REST API only:
- `getProvider(apiKey)` in `index.ts` returns a `GoogleTranslateProvider`
- Batches at 100 items per request (API limit)
- Frontend sends batches and updates per-file progress after each response
- `apiKey` comes from request body (no server-side env var required)

**API endpoint**: `POST /api/translate`
- Accepts `{ items: TranslationItem[], filename: string, apiKey: string }`
- Returns `{ items: TranslationItem[] }`
- `TranslationItem = { id: number, text: string }`

**File list header** shows three live counters:
- `X translated` (green) — files with `status === 'done'`
- `X error(s)` (red) — only shown when `errorCount > 0`
- `X total` (grey) — all validated files

### Key env vars (see `.env.example`)
```
GOOGLE_TRANSLATE_API_KEY=""   # optional — key now comes from client localStorage
```

### Commit conventions
- Simple, descriptive messages — `feat:`, `fix:`, `chore:`, `refactor:`
- One commit per file or logical group
- No co-author attribution
- Update CLAUDE.md after each commit session

### Current state
- All core features complete and working
- Per-user API key stored in localStorage; validated against the API on save
- Settings modal: unclosable on first run, reopenable via header button
- Folder selector supports click-to-browse and drag-and-drop
- Codebase fully refactored: SOLID components, typed handlers, reactive state class, pure XML utilities
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
