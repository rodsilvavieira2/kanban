# AGENTS.md — TaskMaster Kanban

Coding-agent instructions for this repository. Read before making changes.

---

## Project Overview

TaskMaster is an offline-first Electron desktop app with an embedded MCP (Model Context Protocol) server. It uses a three-process Electron model:

1. **Main Process** (Node.js) — SQLite database, MCP server, IPC handlers, use cases, repositories
2. **Preload Script** — `contextBridge` exposes a typed `kanbanApi` to the renderer; `nodeIntegration` is disabled
3. **Renderer Process** (React + Zustand) — pure UI, communicates only through `window.kanbanApi`

Tech stack: **Electron 41 · React 19 · Zustand 5 · Zod 4 · better-sqlite3 · Vite 8 · Electron Forge 7 · TypeScript (strict) · SCSS**

---

## Build, Lint & Format Commands

**Package manager: Yarn 4 (Berry, node-modules linker)**

```bash
yarn install          # Install dependencies
yarn start            # Start dev mode (Vite + Electron hot reload)
yarn lint             # ESLint on all .ts/.tsx files
yarn format           # Prettier on src/**/*.{ts,tsx,json,css,scss}
yarn package          # Package the Electron app (no installer)
yarn make             # Build platform distributables (deb, rpm, zip, squirrel)
```

> The `GEMINI.md` mentions `npm start`; prefer `yarn` — this project uses Yarn Berry.

### Tests

**No test framework is currently installed.** There are no test files. When tests are added, Vitest is the natural fit (Vite is already the bundler). There is no `yarn test` command yet.

---

## Architecture & Directory Layout

```
src/
├── main/
│   ├── index.ts                    # Entry: manual DI, window creation, MCP start
│   ├── core/
│   │   ├── McpServer.ts            # MCP tools/resources (AI agent integration)
│   │   ├── domain/repositories/    # Repository interfaces (I-prefixed)
│   │   └── useCases/               # One class per business action
│   ├── data/
│   │   ├── database/DatabaseConnection.ts  # SQLite init, migrations, WAL
│   │   └── repositories/           # SQLite implementations
│   └── presentation/ipc/
│       └── KanbanIpcHandlers.ts    # All ipcMain.handle registrations
├── preload/index.ts                # contextBridge → kanbanApi
├── renderer/
│   ├── api.ts                      # Typed kanbanApi accessor
│   ├── App.tsx                     # createHashRouter route definitions
│   ├── components/                 # Page-level React components
│   ├── features/                   # Feature-grouped sub-components + barrel exports
│   ├── layouts/RootLayout.tsx      # Shell: Sidebar + Outlet + theme application
│   ├── stores/                     # Zustand stores (one per domain area)
│   ├── styles/global.scss          # Monolithic SCSS (~2500 lines), all styling here
│   └── utils/
└── shared/
    ├── schemas/models.ts           # Zod schemas → inferred TypeScript types (single source of truth)
    └── themes.ts                   # 20 theme color palettes (light + dark variants)
```

---

## TypeScript

- **`noImplicitAny: true`** — every value must have an explicit type; no implicit `any`
- **`strictNullChecks` is NOT enabled** — be aware that `null`/`undefined` are not enforced by the compiler
- **`moduleResolution: "bundler"`** — Vite-compatible; do not use `node16`/`nodenext` patterns
- **`jsx: "react-jsx"`** — new JSX transform; React import is not strictly required, but many files still import it explicitly — follow the style of the file you are editing
- Avoid `as any`; use `unknown` + `instanceof` narrowing instead
- Domain types come exclusively from `z.infer<typeof Schema>` in `src/shared/schemas/models.ts` — do not hand-write parallel types

---

## Code Style

### Naming

| Entity | Convention | Example |
|---|---|---|
| Files (classes/components) | PascalCase | `KanbanBoard.tsx`, `CreateTaskUseCase.ts` |
| Files (utilities/config) | camelCase | `kanbanStore.ts`, `themeUtils.ts` |
| Repository interfaces | `I`-prefix + PascalCase | `ITaskRepository` |
| Other interfaces/types | PascalCase, no prefix | `KanbanState`, `SidebarProps` |
| Classes (use cases, repos) | PascalCase | `SQLiteTaskRepository` |
| React components | Named exports, PascalCase | `export function KanbanBoard()` |
| Zustand stores | `use`-prefixed hooks | `useKanbanStore`, `useProjectStore` |
| IPC channel strings | kebab-case | `"get-projects"`, `"move-task"` |
| CSS classes | kebab-case | `kanban-view`, `task-title` |
| CSS custom properties | kebab-case | `--bg-main`, `--accent-color` |

### Imports

No path aliases (`@/`). Use relative paths throughout.

Group imports in this order (blank line between groups, no enforced tooling):
1. Node built-ins and third-party packages (React, Electron, Zod, etc.)
2. Shared schemas/types (`../../shared/...`)
3. Internal modules (domain interfaces, repositories, use cases)
4. Relative siblings

In `main/index.ts`, comment groups explicitly: `// Repositories`, `// Use Cases`, `// Handlers & Servers`.

### React Components

- Always use **named exports** (`export function Foo()`), not default exports (except `App.tsx`)
- Props interfaces are defined inline at the top of the file
- Use `useEffect` for data loading on mount; consume Zustand stores directly inside components
- CSS classes are toggled via template literals: `` className={`card ${isDragging ? "dragging" : ""}`} ``

### Error Handling

In Zustand store actions, always use this pattern:
```ts
try {
  const result = await kanbanApi.someMethod(data);
  set({ data: result, isLoading: false });
} catch (error: unknown) {
  set({
    error: error instanceof Error ? error.message : "Descriptive fallback message",
    isLoading: false,
  });
}
```

In IPC handlers, log then re-throw:
```ts
ipcMain.handle("channel-name", async () => {
  try {
    return await someUseCase.execute();
  } catch (error) {
    console.error("Failed to <action> (IPC):", error);
    throw error;
  }
});
```

In use cases, use guard clauses at the top before any logic:
```ts
if (!input.title || !input.columnId) {
  throw new Error("Task title and column ID are required");
}
```

Always catch with `error: unknown` and narrow with `instanceof Error`.

---

## Zustand Store Shape

Every store follows this interface shape:
```ts
interface SomeState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  createItem: (...args) => Promise<void>;
}
```

**State sync strategy:**
- **Optimistic update** (e.g., `moveTask`, `updateSetting`): Update local state first, call IPC, revert on error
- **Re-fetch** (e.g., `createProject`, `deleteProject`): Call IPC, then re-load from SQLite
- **AI-triggered updates**: Listen to `kanbanApi.onKanbanUpdated(cb)` to reload after MCP tool executions

---

## IPC / Security Rules

- The renderer has **zero access** to Node.js APIs — all backend calls go through `window.kanbanApi` (defined in `preload/index.ts` via `contextBridge`)
- Use `ipcRenderer.invoke` / `ipcMain.handle` for all request-response IPC
- The push event `"kanban-updated"` uses `ipcRenderer.on` — the only one-way channel
- Never set `nodeIntegration: true` or `contextIsolation: false`
- The typed accessor for `kanbanApi` lives in `src/renderer/api.ts`

---

## Data / Zod Validation

- **`src/shared/schemas/models.ts` is the single source of truth** for all domain types
- Types are derived via `z.infer<typeof Schema>` — never declare parallel hand-written interfaces for domain entities
- Validate payloads at **both** ends: renderer (before IPC call) and main process (before SQLite/MCP)
- Use `Partial<Task>` for update payloads

---

## Database (SQLite)

- `better-sqlite3` is synchronous — all `.prepare().run()/.get()/.all()` calls are blocking but fast
- Repository methods are declared `async` / return `Promise<T>` for interface compatibility; the body is synchronous
- `mapToEntity()` private method in each repository converts raw `Record<string, unknown>` rows (snake_case) to typed domain objects (camelCase) using `as string` casting
- Schema migrations are version-gated, sequential, run in transactions at startup (`DatabaseConnection.ts`)
- DB is at `./data/kanban.sqlite` in dev, `userData/database/kanban.sqlite` in production
- **Never add synchronous-blocking operations to the renderer process**

---

## Styling

- **Single monolithic SCSS file**: `src/renderer/styles/global.scss` — all styles live here; no CSS modules, no CSS-in-JS
- Design system: **Vercel Geist** — high contrast, minimalist geometric, dark-first
- **CSS custom properties (design tokens)** on `:root`:
  - Backgrounds: `--bg-main` (#000), `--bg-secondary` (#111), `--bg-sidebar`
  - Borders: `--border-color` (Accents 2: #333), `--border-hover` (Accents 3: #444)
  - Text: `--text-primary` (#fff), `--text-secondary` (#888), `--text-tertiary` (#666)
  - Accent: `--accent-color` (Vercel Blue: #0070F3), `--success`, `--warning` (#F5A623), `--error` (#EE0000)
  - `--radius: 8px`
- Avoid drop shadows; use incremental border colors for depth
- Typography: Geist Sans (UI/body), Geist Mono (numeric/technical labels), fallback to Inter
- Use `tabular-nums` for all numeric data (timers, counters)
- Theme switching sets CSS custom properties on `document.documentElement` at runtime (see `RootLayout.tsx`)
- Icons: `lucide-react`, 24×24px, stroke-width 1.5–2px, `stroke="currentColor"`

---

## MCP Server

`McpServer.ts` wraps `@modelcontextprotocol/sdk` with:
- **Resources**: `kanban://projects/{id}/board` — returns full board JSON
- **Tools**: `get_projects`, `create_project`, `delete_project`, `create_task`, `update_task`, `move_task`, `update_task_time`, `get_recent_activity`
- After each tool succeeds (except `get_recent_activity`), call `this.onDataUpdated()` to push `"kanban-updated"` to the renderer
- Transport: `StreamableHTTPServerTransport` on `http://127.0.0.1:3282/mcp` — a new `McpSdkServer` instance is created per POST request (stateless mode; `connect()` must not be called twice on the same instance). CORS is fully open.
- Pass the `onDataUpdated` callback through the constructor — do not couple `McpServer` to the Electron window directly
