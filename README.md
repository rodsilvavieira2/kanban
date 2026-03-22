# Kanban

A desktop Kanban application built with Electron, React, and TypeScript.

## Features

- **Kanban Board**: Visualize and manage your tasks through customizable columns. Drag and drop tasks between columns to update their status.
- **Dashboard**: Get an overview of your productivity with summary cards, an activity feed, and priority breakdown charts.
- **Pomodoro Timer**: Stay focused using the built-in Pomodoro timer with customizable work and break intervals.
- **Settings**: Customize your experience including themes, Pomodoro durations, and column management.
- **Offline First**: All data is stored locally using SQLite, ensuring privacy and offline availability.
- **MCP Integration**: Includes Model Context Protocol (MCP) integration.

## Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/)
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Drag and Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Database**: [SQLite](https://www.sqlite.org/)
- **Charts**: [Chart.js](https://www.chartjs.org/) and [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Styling**: SCSS, CSS Modules

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kanban
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the App

To start the application in development mode:

```bash
yarn start
```

## Available Scripts

- `yarn start` - Starts the Electron application in development mode with hot reloading.
- `yarn package` - Packages the application for the local platform.
- `yarn make` - Creates distributable installers (e.g., `.deb`, `.rpm`, `.zip`).
- `yarn lint` - Runs ESLint to find and fix code style issues.
- `yarn format` - Formats the codebase using Prettier.

## License

This project is licensed under the [MIT License](LICENSE).
