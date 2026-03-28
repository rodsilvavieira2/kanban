import { ipcMain, dialog } from "electron";
import fs from "fs";
import { GetProjectsUseCase } from "../../core/useCases/project/GetProjectsUseCase";
import { CreateProjectUseCase } from "../../core/useCases/project/CreateProjectUseCase";
import { DeleteProjectUseCase } from "../../core/useCases/project/DeleteProjectUseCase";
import { GetProjectDataUseCase } from "../../core/useCases/project/GetProjectDataUseCase";
import { CreateTaskUseCase } from "../../core/useCases/task/CreateTaskUseCase";
import { UpdateTaskUseCase } from "../../core/useCases/task/UpdateTaskUseCase";
import { MoveTaskUseCase } from "../../core/useCases/task/MoveTaskUseCase";
import { UpdateTaskTimeUseCase } from "../../core/useCases/task/UpdateTaskTimeUseCase";
import { DeleteTaskUseCase } from "../../core/useCases/kanban/DeleteTaskUseCase";
import { GetRecentActivityUseCase } from "../../core/useCases/activity/GetRecentActivityUseCase";
import { GetSettingsUseCase } from "../../core/useCases/settings/GetSettingsUseCase";
import { UpdateSettingsUseCase } from "../../core/useCases/settings/UpdateSettingsUseCase";
import { ExportDataUseCase } from "../../core/useCases/export/ExportDataUseCase";

export function setupKanbanIpcHandlers(
  getProjectsUseCase: GetProjectsUseCase,
  createProjectUseCase: CreateProjectUseCase,
  deleteProjectUseCase: DeleteProjectUseCase,
  getProjectDataUseCase: GetProjectDataUseCase,
  createTaskUseCase: CreateTaskUseCase,
  updateTaskUseCase: UpdateTaskUseCase,
  moveTaskUseCase: MoveTaskUseCase,
  updateTaskTimeUseCase: UpdateTaskTimeUseCase,
  deleteTaskUseCase: DeleteTaskUseCase,
  getRecentActivityUseCase: GetRecentActivityUseCase,
  getSettingsUseCase: GetSettingsUseCase,
  updateSettingsUseCase: UpdateSettingsUseCase,
  exportDataUseCase: ExportDataUseCase,
) {
  // --- Project IPC Handlers ---

  ipcMain.handle("get-projects", async () => {
    try {
      return await getProjectsUseCase.execute();
    } catch (error) {
      console.error("Failed to get projects (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("create-project", async (event, projectData) => {
    try {
      return await createProjectUseCase.execute(projectData);
    } catch (error) {
      console.error("Failed to create project (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("delete-project", async (event, id) => {
    try {
      await deleteProjectUseCase.execute(id);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete project (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("get-project-data", async (event, projectId) => {
    try {
      return await getProjectDataUseCase.execute(projectId);
    } catch (error) {
      console.error("Failed to get project data (IPC):", error);
      throw error;
    }
  });

  // --- Task IPC Handlers ---

  ipcMain.handle("create-task", async (event, taskData) => {
    try {
      return await createTaskUseCase.execute(taskData);
    } catch (error) {
      console.error("Failed to create task (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("update-task", async (event, { taskId, data }) => {
    try {
      return await updateTaskUseCase.execute(taskId, data);
    } catch (error) {
      console.error("Failed to update task (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("move-task", async (event, request) => {
    try {
      await moveTaskUseCase.execute(request);
      return { success: true };
    } catch (error) {
      console.error("Failed to move task (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("update-task-time", async (event, { taskId, minutes }) => {
    try {
      await updateTaskTimeUseCase.execute(taskId, minutes);
      return { success: true };
    } catch (error) {
      console.error("Failed to update task time (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("delete-task", async (event, taskId) => {
    try {
      await deleteTaskUseCase.execute(taskId);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete task (IPC):", error);
      throw error;
    }
  });

  // --- Activity IPC Handlers ---

  ipcMain.handle("get-recent-activity", async (event, limit) => {
    try {
      return await getRecentActivityUseCase.execute(limit);
    } catch (error) {
      console.error("Failed to get recent activity (IPC):", error);
      throw error;
    }
  });

  // --- Settings IPC Handlers ---

  ipcMain.handle("get-settings", async () => {
    try {
      return await getSettingsUseCase.execute();
    } catch (error) {
      console.error("Failed to get settings (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle("update-settings", async (event, settings) => {
    try {
      await updateSettingsUseCase.execute(settings);
      return { success: true };
    } catch (error) {
      console.error("Failed to update settings (IPC):", error);
      throw error;
    }
  });

  // --- Export IPC Handlers ---

  ipcMain.handle("export-data", async () => {
    try {
      return await exportDataUseCase.execute();
    } catch (error) {
      console.error("Failed to export data (IPC):", error);
      throw error;
    }
  });

  ipcMain.handle(
    "show-save-dialog",
    async (
      event,
      {
        defaultFilename,
        content,
      }: { defaultFilename: string; content: string },
    ) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: "Export Workspace Data",
          defaultPath: defaultFilename,
          filters: [{ name: "JSON Files", extensions: ["json"] }],
          properties: ["showOverwriteConfirmation"],
        });

        if (canceled || !filePath) {
          return { success: false, canceled: true };
        }

        fs.writeFileSync(filePath, content, "utf-8");
        return { success: true, filePath };
      } catch (error) {
        console.error("Failed to save file (IPC):", error);
        throw error;
      }
    },
  );
}
