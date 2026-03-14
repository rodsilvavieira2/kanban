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
The application follows a high-contrast, minimalist design inspired by the Vercel (Geist) design system.

**Core Palette:**
*   **Background (Main):** `#000000` (Pure Black)
*   **Background (Secondary):** `#111111`
*   **Borders:** `#333333` (Default), `#444444` (Hover)
*   **Text (Primary):** `#FFFFFF` (Pure White)
*   **Text (Secondary):** `#888888`
*   **Text (Tertiary):** `#666666`
*   **Accent/Action:** `#0070F3` (Vercel Blue)
*   **Success:** `#0070F3`
*   **Warning:** `#F5A623`
*   **Error:** `#EE0000`

**Typography:**
*   **Primary Font:** `Inter` (Sans-serif)
*   **Characteristics:** Optimized for readability with tight letter-spacing and varied weights (400 to 700).

**Layout & Components:**
*   **Border Radius:** `8px` (`var(--radius)`) for most components.
*   **Aesthetics:** Clean lines, generous padding, and subtle interactive feedback (e.g., border color shifts on hover).

## Development Conventions
*   **Security & IPC:** The React frontend has no direct access to Node.js APIs. All communication with SQLite and the MCP server must go through the `window.api` bridge defined in `preload.ts`.
*   **Data Validation:** Zod schemas must be shared between the frontend and backend. Both the React UI (before sending IPC) and the Node.js backend (before executing SQLite/MCP requests) must validate payloads using the exact same schema.
*   **State Synchronization:** The Zustand store should not directly mutate data. When an action occurs (drag-and-drop or AI tool execution), it updates SQLite via IPC, which then broadcasts an update event (e.g., `kanban-updated`). Zustand listens to this event to fetch the latest state and update the UI.
*   **Styling:** Prefer modular SCSS over CSS-in-JS to maintain fast initial rendering performance and granular control over the UI, particularly the dark theme.
*   **Database:** Operations on SQLite should leverage `better-sqlite3` for synchronous atomic writes within the main Node thread, avoiding UI blocking while maximizing speed for the single-user desktop environment.
