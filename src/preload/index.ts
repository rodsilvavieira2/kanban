// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

export const EXPOSED_API_KEY = 'kanbanApi';

const kanbanApi = {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (data: any) => ipcRenderer.invoke('create-project', data),
  deleteProject: (id: string) => ipcRenderer.invoke('delete-project', id),
  getProjectData: (projectId: string) => ipcRenderer.invoke('get-project-data', projectId),
  createTask: (data: any) => ipcRenderer.invoke('create-task', data),
  moveTask: (request: any) => ipcRenderer.invoke('move-task', request),
  updateTaskTime: (taskId: string, minutes: number) => ipcRenderer.invoke('update-task-time', { taskId, minutes }),
};

// Use contextBridge to expose safety limited APIs to the Renderer Process
contextBridge.exposeInMainWorld(EXPOSED_API_KEY, kanbanApi);

// Type definition for typescript in Renderer
export type KanbanApiType = typeof kanbanApi;
