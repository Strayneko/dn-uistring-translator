## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter, drizzle, mcp, vitest

---

## Project: XML String Translator

A SvelteKit web app that translates Chinese CDATA strings inside XML files to English using Google Translate API. Built with a dark blue theme.

### What it does
1. User selects a folder via `webkitdirectory` file input
2. A custom themed confirmation modal appears showing folder path + XML file count
3. On confirm: scans and validates XML files, then translates them sequentially
4. Each file's CDATA sections are extracted, sent to Google Translate in batches of 100, substituted back
5. Per-file progress bar shows "X / Y strings" during translation
6. After all files complete, a "Download ZIP" button appears — downloads all translated XMLs as `<folderName>.zip`

### Architecture

**Translation provider pattern** — swap providers via `TRANSLATION_PROVIDER` env var:
- `google` (default) — Google Translate v2 REST API (`src/lib/server/translate/google.ts`)
- `anthropic` — Claude Haiku (`src/lib/server/translate/anthropic.ts`)
- `openai` — GPT-4o-mini (`src/lib/server/translate/openai.ts`)
- Interface: `TranslationProvider` in `src/lib/server/translate/types.ts`
- Factory: `getProvider()` in `src/lib/server/translate/index.ts`

**API endpoint**: `POST /api/translate` (`src/routes/api/translate/+server.ts`)
- Accepts `{ items: TranslationItem[], filename: string }`
- Returns `{ items: TranslationItem[] }`
- `TranslationItem = { id: number, text: string }`

**Frontend** (`src/routes/+page.svelte`):
- `SvelteMap` for `fileMap` (File objects) and `translatedContents` (translated XML strings)
- `BATCH_SIZE = 100` — sends 100 CDATA items per API call (Google Translate limit)
- `extractCdata(xml)` — extracts all `<![CDATA[...]]>` as `TranslationItem[]`
- `substituteCdata(xml, translations)` — substitutes translated items back
- `XmlFile` type: `{ name, lines, totalStrings, translatedStrings, status, errorMsg? }`
- Status values: `pending | in-progress | done | error`
- File list is scrollable (`max-h-104`) with custom dark blue scrollbar

### Key env vars (see `.env.example`)
```
TRANSLATION_PROVIDER="google"   # google | anthropic | openai
GOOGLE_TRANSLATE_API_KEY=""
CLAUDE_API_KEY=""
OPENAI_API_KEY=""
```

### Commit conventions
- Simple, descriptive messages — `feat:`, `fix:`, `chore:`
- One commit per file or logical group
- No co-author attribution

### Current state (as of last session)
- All core features complete and working
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
