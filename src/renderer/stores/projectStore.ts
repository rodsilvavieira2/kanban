import { create } from 'zustand';
import { Project } from '../../shared/schemas/models';
import { KanbanApiType } from '../../preload';

declare global {
  interface Window {
    kanbanApi: KanbanApiType;
  }
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  loadProjects: () => Promise<void>;
  createProject: (data: { name: string; description?: string; status?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  initUpdateListener: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await window.kanbanApi.getProjects();
      set({ projects, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      set({ error: error.message || 'Failed to load projects', isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      await window.kanbanApi.createProject(data);
      // Re-fetch to stay in sync with SQLite
      await get().loadProjects();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create project' });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await window.kanbanApi.deleteProject(id);
      // Re-fetch to stay in sync with SQLite
      await get().loadProjects();
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      set({ error: error.message || 'Failed to delete project' });
      throw error;
    }
  },

  getProjectById: (id: string) => {
    return get().projects.find(p => p.id === id);
  },

  initUpdateListener: () => {
    if (window.kanbanApi?.onKanbanUpdated) {
      window.kanbanApi.onKanbanUpdated(() => {
        get().loadProjects();
      });
    }
  },
}));
