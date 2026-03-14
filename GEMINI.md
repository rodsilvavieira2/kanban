# TaskMaster - AI-First Desktop Kanban

## Project Overview
TaskMaster is an offline-first desktop Kanban project management application with a unique AI-First architecture. It features a built-in MCP (Model Context Protocol) server running in the background, allowing local AI agents (e.g., Claude Desktop) to interact with the database and update the application state in real-time, syncing seamlessly with the visual drag-and-drop interface.

**Main Technologies:**
*   **Container:** Electron (Node.js)
*   **Frontend:** React, styled with SCSS (Sass) for modularity and native Dark Theme.
*   **State Management:** Zustand
*   **Data Validation:** Zod
*   **Database:** SQLite (local file, using `better-sqlite3` for fast, synchronous execution)
*   **AI Integration:** `@modelcontextprotocol/sdk` (running in the Electron Main Process)

**Architecture:**
The application uses Electron's isolated multi-process pattern:
1.  **Main Process (Node.js):** Hosts the SQLite database and the native MCP Server. Handles OS I/O and exposes tools/resources to AI agents.
2.  **Preload Script (ContextBridge):** Provides a strongly-typed, secure IPC bridge between the Node.js backend and the React frontend. `nodeIntegration` is disabled and `contextIsolation` is enabled.
3.  **Renderer Process (React):** A reactive UI layer where Zustand acts as a mirror to the SQLite database. Any changes (manual or via AI) trigger an IPC broadcast that updates the UI instantly without needing a refresh.

## Building and Running
The project is built using Vite and Electron Forge. Ensure you have run `npm install` before proceeding.

*   **Start Application (Development):**
    ```bash
    npm start
    ```
    *(Runs `electron-forge start`)*

*   **Package Application:**
    ```bash
    npm run package
    ```

*   **Make Distributables:**
    ```bash
    npm run make
    ```

*   **Linting:**
    ```bash
    npm run lint
    ```

*(Note: Specific testing commands/frameworks are to be defined, but end-to-end testing between Manual UI and AI Agent interactions is a planned phase).*

## Design System
The application strictly follows the **Vercel Geist** design system, characterized by high contrast, minimalist geometric precision, and a "pure" dark theme.

### **1. Color Palette (Dark Mode)**
Hierarchy is defined by scale-based grayscale values and specific semantic accents.
*   **Backgrounds:**
    *   `Background 1` (Main): `#000000` (Pure Black)
    *   `Background 2` (Secondary): `#111111`
*   **Accents (Grayscale Scale):**
    *   `Accents 2` (Borders): `#333333`
    *   `Accents 3` (Hover Borders): `#444444`
    *   `Accents 4` (Tertiary Text/Icons): `#666666`
    *   `Accents 5` (Secondary Text): `#888888`
    *   `Accents 8` (Primary Text): `#FFFFFF`
*   **Semantic Accents:**
    *   `Blue/Success`: `#0070F3` (Vercel Blue)
    *   `Warning`: `#F5A623`
    *   `Error`: `#EE0000`

### **2. Typography**
*   **Fonts:** `Geist Sans` (UI/Body) and `Geist Mono` (Data/Technical labels). Fallback to `Inter` if Geist is unavailable.
*   **Sizing:** 
    *   `Label 14`: 14px (Standard UI/Buttons).
    *   `Copy 16`: 16px (Body text).
*   **Weights:** Regular (400) for body, Medium (500) for labels/icons, Bold (700) for headers.
*   **Principles:** 
    *   Tight tracking (`-0.02em` to `-0.05em`) for headings.
    *   `tabular-nums` for all numeric data (timers, counters) to prevent jumping.

### **3. Icons**
*   **Style:** Minimalist, geometric, outline-based.
*   **Specifications:** 24x24px grid, `stroke-width` of 1.5px to 2px.
*   **Implementation:** Standardize on `@geist-ui/icons` or equivalent SVG specs using `stroke="currentColor"`.

### **4. Elevation & Borders**
*   Avoid heavy drop shadows. Define depth using incremental border colors (`Accents 2` -> `Accents 3`).
*   Standard Border Radius: `8px` (`var(--radius)`).


## Development Conventions
*   **Security & IPC:** The React frontend has no direct access to Node.js APIs. All communication with SQLite and the MCP server must go through the `window.api` bridge defined in `preload.ts`.
*   **Data Validation:** Zod schemas must be shared between the frontend and backend. Both the React UI (before sending IPC) and the Node.js backend (before executing SQLite/MCP requests) must validate payloads using the exact same schema.
*   **State Synchronization:** The Zustand store should not directly mutate data. When an action occurs (drag-and-drop or AI tool execution), it updates SQLite via IPC, which then broadcasts an update event (e.g., `kanban-updated`). Zustand listens to this event to fetch the latest state and update the UI.
*   **Styling:** Prefer modular SCSS over CSS-in-JS to maintain fast initial rendering performance and granular control over the UI, particularly the dark theme.
*   **Database:** Operations on SQLite should leverage `better-sqlite3` for synchronous atomic writes within the main Node thread, avoiding UI blocking while maximizing speed for the single-user desktop environment.
