import { create } from "zustand";
import { Column, Task } from "../../shared/schemas/models";
import { kanbanApi } from "../api";

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProjectData: (projectId: string) => Promise<void>;
  loadAllTasks: () => Promise<void>;
  createTask: (projectId: string, taskData: Partial<Task>) => Promise<void>;
  moveTask: (request: {
    taskId: string;
    sourceColumnId: string;
    destinationColumnId: string;
    sourceIndex: number;
    destinationIndex: number;
  }) => Promise<void>;
  updateTaskTime: (taskId: string, minutes: number) => Promise<void>;
  initUpdateListener: (projectId: string) => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [],
  tasks: [],
  isLoading: false,
  error: null,

  loadProjectData: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { columns, tasks } = await kanbanApi.getProjectData(projectId);
      set({ columns, tasks, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to load project data",
        isLoading: false,
      });
    }
  },

  loadAllTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await kanbanApi.getProjects();
      let allTasks: Task[] = [];
      for (const project of projects) {
        const { tasks } = await kanbanApi.getProjectData(project.id);
        allTasks = [...allTasks, ...tasks.map(t => ({ ...t, projectId: project.id }))];
      }
      set({ tasks: allTasks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to load tasks", isLoading: false });
    }
  },

  createTask: async (projectId: string, taskData: Partial<Task>) => {
    try {
      const newTask = await kanbanApi.createTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, newTask],
      }));
    } catch (error: any) {
      set({ error: error.message || "Failed to create task" });
    }
  },

  moveTask: async (request) => {
    const {
      taskId,
      sourceColumnId,
      destinationColumnId,
      sourceIndex,
      destinationIndex,
    } = request;
    const { tasks } = get();

    // Optimistic Update
    const newTasks = [...tasks];

    if (sourceColumnId === destinationColumnId) {
      const columnTasks = newTasks
        .filter((t) => t.columnId === sourceColumnId)
        .sort((a, b) => a.order - b.order);
      const movedTask = columnTasks.splice(sourceIndex, 1)[0];
      columnTasks.splice(destinationIndex, 0, movedTask);

      columnTasks.forEach((t, index) => {
        const originalIndex = newTasks.findIndex((nt) => nt.id === t.id);
        if (originalIndex !== -1) {
          newTasks[originalIndex] = {
            ...newTasks[originalIndex],
            order: index,
          };
        }
      });
    } else {
      const sourceTasks = newTasks
        .filter((t) => t.columnId === sourceColumnId)
        .sort((a, b) => a.order - b.order);
      const destTasks = newTasks
        .filter((t) => t.columnId === destinationColumnId)
        .sort((a, b) => a.order - b.order);

      const movedTask = sourceTasks.splice(sourceIndex, 1)[0];
      movedTask.columnId = destinationColumnId;
      destTasks.splice(destinationIndex, 0, movedTask);

      sourceTasks.forEach((t, index) => {
        const originalIndex = newTasks.findIndex((nt) => nt.id === t.id);
        if (originalIndex !== -1) {
          newTasks[originalIndex] = {
            ...newTasks[originalIndex],
            order: index,
          };
        }
      });

      destTasks.forEach((t, index) => {
        const originalIndex = newTasks.findIndex((nt) => nt.id === t.id);
        if (originalIndex !== -1) {
          newTasks[originalIndex] = {
            ...newTasks[originalIndex],
            order: index,
            columnId: destinationColumnId,
          };
        }
      });
    }

    set({ tasks: newTasks });

    try {
      await kanbanApi.moveTask(request);
    } catch (error: any) {
      console.error("Failed to move task (IPC):", error);
      set({ error: error.message || "Failed to move task, please refresh." });
    }
  },

  updateTaskTime: async (taskId: string, minutes: number) => {
    try {
      await kanbanApi.updateTaskTime(taskId, minutes);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, timeSpentMinutes: (t.timeSpentMinutes || 0) + minutes }
            : t,
        ),
      }));
    } catch (error: any) {
      console.error("Failed to update task time:", error);
      set({ error: error.message || "Failed to update task time" });
    }
  },

  initUpdateListener: (projectId: string) => {
    if (kanbanApi?.onKanbanUpdated) {
      kanbanApi.onKanbanUpdated(() => {
        get().loadProjectData(projectId);
      });
    }
  },
}));
