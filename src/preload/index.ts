// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

export const EXPOSED_API_KEY = 'kanbanApi';

const kanbanApi = {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (data: any) => ipcRenderer.invoke('create-project', data),
  deleteProject: (id: string) => ipcRenderer.invoke('delete-project', id),
};

// Use contextBridge to expose safety limited APIs to the Renderer Process
contextBridge.exposeInMainWorld(EXPOSED_API_KEY, kanbanApi);

// Type definition for typescript in Renderer
export type KanbanApiType = typeof kanbanApi;
