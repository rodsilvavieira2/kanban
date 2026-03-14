import { ipcMain } from 'electron';
import db from '../../data/database/DatabaseConnection';
import { SQLiteProjectRepository } from '../../data/repositories/SQLiteProjectRepository';
import { GetProjectsUseCase } from '../../core/useCases/project/GetProjectsUseCase';
import { CreateProjectUseCase } from '../../core/useCases/project/CreateProjectUseCase';
import { DeleteProjectUseCase } from '../../core/useCases/project/DeleteProjectUseCase';

export function setupProjectIpcHandlers() {
  const projectRepository = new SQLiteProjectRepository(db);
  
  const getProjectsUseCase = new GetProjectsUseCase(projectRepository);
  const createProjectUseCase = new CreateProjectUseCase(projectRepository);
  const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);

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
}
