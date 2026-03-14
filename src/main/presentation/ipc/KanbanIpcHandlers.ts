import { ipcMain } from 'electron';
import { GetProjectsUseCase } from '../../core/useCases/project/GetProjectsUseCase';
import { CreateProjectUseCase } from '../../core/useCases/project/CreateProjectUseCase';
import { DeleteProjectUseCase } from '../../core/useCases/project/DeleteProjectUseCase';
import { GetProjectDataUseCase } from '../../core/useCases/project/GetProjectDataUseCase';
import { CreateTaskUseCase } from '../../core/useCases/task/CreateTaskUseCase';
import { MoveTaskUseCase } from '../../core/useCases/task/MoveTaskUseCase';
import { UpdateTaskTimeUseCase } from '../../core/useCases/task/UpdateTaskTimeUseCase';

export function setupKanbanIpcHandlers(
  getProjectsUseCase: GetProjectsUseCase,
  createProjectUseCase: CreateProjectUseCase,
  deleteProjectUseCase: DeleteProjectUseCase,
  getProjectDataUseCase: GetProjectDataUseCase,
  createTaskUseCase: CreateTaskUseCase,
  moveTaskUseCase: MoveTaskUseCase,
  updateTaskTimeUseCase: UpdateTaskTimeUseCase
) {
  // --- Project IPC Handlers ---
  
  ipcMain.handle('get-projects', async () => {
    try {
      return await getProjectsUseCase.execute();
    } catch (error) {
      console.error('Failed to get projects (IPC):', error);
      throw error;
    }
  });

  ipcMain.handle('create-project', async (event, projectData) => {
    try {
      return await createProjectUseCase.execute(projectData);
    } catch (error) {
      console.error('Failed to create project (IPC):', error);
      throw error;
    }
  });
  
  ipcMain.handle('delete-project', async (event, id) => {
    try {
      await deleteProjectUseCase.execute(id);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete project (IPC):', error);
      throw error;
    }
  });

  ipcMain.handle('get-project-data', async (event, projectId) => {
    try {
      return await getProjectDataUseCase.execute(projectId);
    } catch (error) {
      console.error('Failed to get project data (IPC):', error);
      throw error;
    }
  });

  // --- Task IPC Handlers ---

  ipcMain.handle('create-task', async (event, taskData) => {
    try {
      return await createTaskUseCase.execute(taskData);
    } catch (error) {
      console.error('Failed to create task (IPC):', error);
      throw error;
    }
  });

  ipcMain.handle('move-task', async (event, request) => {
    try {
      await moveTaskUseCase.execute(request);
      return { success: true };
    } catch (error) {
      console.error('Failed to move task (IPC):', error);
      throw error;
    }
  });

  ipcMain.handle('update-task-time', async (event, { taskId, minutes }) => {
    try {
      await updateTaskTimeUseCase.execute(taskId, minutes);
      return { success: true };
    } catch (error) {
      console.error('Failed to update task time (IPC):', error);
      throw error;
    }
  });
}
