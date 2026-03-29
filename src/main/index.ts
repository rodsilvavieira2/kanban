import { app, BrowserWindow } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import db, { initDatabase } from "./data/database/DatabaseConnection";

// Repositories
import { SQLiteProjectRepository } from "./data/repositories/SQLiteProjectRepository";
import { SQLiteColumnRepository } from "./data/repositories/SQLiteColumnRepository";
import { SQLiteTaskRepository } from "./data/repositories/SQLiteTaskRepository";
import { SQLiteActivityLogRepository } from "./data/repositories/SQLiteActivityLogRepository";
import { SQLiteSettingsRepository } from "./data/repositories/SQLiteSettingsRepository";

// Use Cases
import { GetProjectsUseCase } from "./core/useCases/project/GetProjectsUseCase";
import { CreateProjectUseCase } from "./core/useCases/project/CreateProjectUseCase";
import { DeleteProjectUseCase } from "./core/useCases/project/DeleteProjectUseCase";
import { GetProjectDataUseCase } from "./core/useCases/project/GetProjectDataUseCase";
import { InitializeProjectColumnsUseCase } from "./core/useCases/column/InitializeProjectColumnsUseCase";
import { CreateColumnUseCase } from "./core/useCases/column/CreateColumnUseCase";
import { EditColumnUseCase } from "./core/useCases/column/EditColumnUseCase";
import { DeleteColumnUseCase } from "./core/useCases/column/DeleteColumnUseCase";
import { MoveColumnUseCase } from "./core/useCases/column/MoveColumnUseCase";
import { CreateTaskUseCase } from "./core/useCases/task/CreateTaskUseCase";
import { UpdateTaskUseCase } from "./core/useCases/task/UpdateTaskUseCase";
import { MoveTaskUseCase } from "./core/useCases/task/MoveTaskUseCase";
import { UpdateTaskTimeUseCase } from "./core/useCases/task/UpdateTaskTimeUseCase";
import { DeleteTaskUseCase } from "./core/useCases/kanban/DeleteTaskUseCase";
import { GetRecentActivityUseCase } from "./core/useCases/activity/GetRecentActivityUseCase";
import { GetSettingsUseCase } from "./core/useCases/settings/GetSettingsUseCase";
import { UpdateSettingsUseCase } from "./core/useCases/settings/UpdateSettingsUseCase";
import { ExportDataUseCase } from "./core/useCases/export/ExportDataUseCase";

// Handlers & Servers
import { setupKanbanIpcHandlers } from "./presentation/ipc/KanbanIpcHandlers";
import { McpServer } from "./core/McpServer";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
    // Remove the default menu bar in production
    mainWindow.setMenu(null);
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

app.on("ready", async () => {
  // 1. Init Database
  initDatabase();

  // 2. Initialize Repositories
  const projectRepository = new SQLiteProjectRepository(db);
  const columnRepository = new SQLiteColumnRepository(db);
  const taskRepository = new SQLiteTaskRepository(db);
  const activityLogRepository = new SQLiteActivityLogRepository(db);
  const settingsRepository = new SQLiteSettingsRepository(db);

  // 3. Initialize Shared Use Cases
  const getProjectsUseCase = new GetProjectsUseCase(projectRepository);
  const initializeColumnsUseCase = new InitializeProjectColumnsUseCase(
    columnRepository,
  );
  const createProjectUseCase = new CreateProjectUseCase(
    projectRepository,
    initializeColumnsUseCase,
  );
  const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);
  const getProjectDataUseCase = new GetProjectDataUseCase(
    projectRepository,
    columnRepository,
    taskRepository,
  );
  const createColumnUseCase = new CreateColumnUseCase(columnRepository);
  const editColumnUseCase = new EditColumnUseCase(columnRepository);
  const deleteColumnUseCase = new DeleteColumnUseCase(columnRepository);
  const moveColumnUseCase = new MoveColumnUseCase(columnRepository);
  const createTaskUseCase = new CreateTaskUseCase(
    taskRepository,
    activityLogRepository,
  );
  const updateTaskUseCase = new UpdateTaskUseCase(
    taskRepository,
    activityLogRepository,
  );
  const moveTaskUseCase = new MoveTaskUseCase(
    taskRepository,
    activityLogRepository,
  );
  const updateTaskTimeUseCase = new UpdateTaskTimeUseCase(taskRepository, activityLogRepository);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository, activityLogRepository);
  const getRecentActivityUseCase = new GetRecentActivityUseCase(
    activityLogRepository,
  );
  const getSettingsUseCase = new GetSettingsUseCase(settingsRepository);
  const updateSettingsUseCase = new UpdateSettingsUseCase(settingsRepository);
  const exportDataUseCase = new ExportDataUseCase(
    projectRepository,
    columnRepository,
    taskRepository,
  );

  // 4. Setup IPC Handlers (for UI)
  setupKanbanIpcHandlers(
    getProjectsUseCase,
    createProjectUseCase,
    deleteProjectUseCase,
    getProjectDataUseCase,
    createColumnUseCase,
    editColumnUseCase,
    deleteColumnUseCase,
    moveColumnUseCase,
    createTaskUseCase,
    updateTaskUseCase,
    moveTaskUseCase,
    updateTaskTimeUseCase,
    deleteTaskUseCase,
    getRecentActivityUseCase,
    getSettingsUseCase,
    updateSettingsUseCase,
    exportDataUseCase,
  );

  // 5. Setup MCP Server (for AI)
  const mcpServer = new McpServer(
    getProjectsUseCase,
    createProjectUseCase,
    deleteProjectUseCase,
    getProjectDataUseCase,
    createColumnUseCase,
    editColumnUseCase,
    deleteColumnUseCase,
    moveColumnUseCase,
    createTaskUseCase,
    updateTaskUseCase,
    moveTaskUseCase,
    updateTaskTimeUseCase,
    deleteTaskUseCase,
    getRecentActivityUseCase,
    () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("kanban-updated");
      }
    },
  );
  await mcpServer.start();

  // 6. Launch UI
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
