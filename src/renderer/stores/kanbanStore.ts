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
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  moveTask: (request: {
    taskId: string;
    sourceColumnId: string;
    destinationColumnId: string;
    sourceIndex: number;
    destinationIndex: number;
  }) => Promise<void>;
  updateTaskTime: (taskId: string, minutes: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
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
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load project data",
        isLoading: false,
      });
    }
  },

  loadAllTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await kanbanApi.getProjects();
      let allTasks: Task[] = [];
      const allColumns: Column[] = [];

      for (const project of projects) {
        const { tasks, columns } = await kanbanApi.getProjectData(project.id);
        allTasks = [
          ...allTasks,
          ...tasks.map((t: Task) => ({ ...t, projectId: project.id })),
        ];

        // Add columns that we don't already have
        for (const col of columns) {
          if (!allColumns.find((c) => c.id === col.id)) {
            allColumns.push(col);
          }
        }
      }
      set({ tasks: allTasks, columns: allColumns, isLoading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to load tasks",
        isLoading: false,
      });
    }
  },

  createTask: async (projectId: string, taskData: Partial<Task>) => {
    const previousTasks = get().tasks;
    // Optimistic creation with a temporary ID
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      title: taskData.title || "",
      description: taskData.description || "",
      columnId: taskData.columnId || "",
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: previousTasks.length,
      ...taskData,
      timeSpentMinutes: taskData.timeSpentMinutes ?? 0,
    };

    set((state) => ({ tasks: [...state.tasks, tempTask] }));

    try {
      const newTask = await kanbanApi.createTask(taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === tempTask.id ? newTask : t)),
      }));
    } catch (error: unknown) {
      set({
        tasks: previousTasks,
        error: error instanceof Error ? error.message : "Failed to create task",
      });
    }
  },

  updateTask: async (taskId: string, taskData: Partial<Task>) => {
    const previousTasks = get().tasks;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...taskData } : t,
      ),
    }));

    try {
      const updatedTask = await kanbanApi.updateTask({
        taskId,
        data: taskData,
      });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }));
    } catch (error: unknown) {
      set({
        tasks: previousTasks,
        error: error instanceof Error ? error.message : "Failed to update task",
      });
    }
  },

  moveTask: async (request) => {
    const {
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
    } catch (error: unknown) {
      console.error("Failed to move task (IPC):", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to move task, please refresh.",
      });
    }
  },

  updateTaskTime: async (taskId: string, minutes: number) => {
    const previousTasks = get().tasks;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, timeSpentMinutes: (t.timeSpentMinutes || 0) + minutes }
          : t,
      ),
    }));

    try {
      await kanbanApi.updateTaskTime(taskId, minutes);
    } catch (error: unknown) {
      console.error("Failed to update task time:", error);
      set({
        tasks: previousTasks,
        error:
          error instanceof Error ? error.message : "Failed to update task time",
      });
    }
  },

  deleteTask: async (taskId: string) => {
    const previousTasks = get().tasks;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));

    try {
      await kanbanApi.deleteTask(taskId);
    } catch (error: unknown) {
      console.error("Failed to delete task:", error);
      set({
        tasks: previousTasks,
        error:
          error instanceof Error ? error.message : "Failed to delete task",
      });
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
