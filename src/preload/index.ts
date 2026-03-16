// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

export const EXPOSED_API_KEY = "kanbanApi";

const kanbanApi = {
  getProjects: () => ipcRenderer.invoke("get-projects"),
  createProject: (data: Record<string, unknown>) => ipcRenderer.invoke("create-project", data),
  deleteProject: (id: string) => ipcRenderer.invoke("delete-project", id),
  getProjectData: (projectId: string) =>
    ipcRenderer.invoke("get-project-data", projectId),
  createTask: (data: Record<string, unknown>) => ipcRenderer.invoke("create-task", data),
  updateTask: (request: { taskId: string; data: Record<string, unknown> }) =>
    ipcRenderer.invoke("update-task", request),
  moveTask: (request: Record<string, unknown>) => ipcRenderer.invoke("move-task", request),
  updateTaskTime: (taskId: string, minutes: number) =>
    ipcRenderer.invoke("update-task-time", { taskId, minutes }),
  onKanbanUpdated: (callback: () => void) => {
    ipcRenderer.removeAllListeners("kanban-updated");
    ipcRenderer.on("kanban-updated", () => callback());
  },
  getRecentActivity: (limit?: number) =>
    ipcRenderer.invoke("get-recent-activity", limit),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  updateSettings: (settings: Record<string, string>) =>
    ipcRenderer.invoke("update-settings", settings),
  exportData: () => ipcRenderer.invoke("export-data"),
  showSaveDialog: (defaultFilename: string, content: string) =>
    ipcRenderer.invoke("show-save-dialog", { defaultFilename, content }),
};

// Use contextBridge to expose safety limited APIs to the Renderer Process
contextBridge.exposeInMainWorld(EXPOSED_API_KEY, kanbanApi);

// Type definition for typescript in Renderer
export type KanbanApiType = typeof kanbanApi;
