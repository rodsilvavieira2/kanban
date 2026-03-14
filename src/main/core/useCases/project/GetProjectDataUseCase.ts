import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IColumnRepository } from '../../domain/repositories/IColumnRepository';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { Project, Column, Task } from '../../../../shared/schemas/models';

export interface ProjectData {
  project: Project;
  columns: Column[];
  tasks: Task[];
}

export class GetProjectDataUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private columnRepository: IColumnRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(projectId: string): Promise<ProjectData> {
    const project = await this.projectRepository.findById(projectId);
    
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const columns = await this.columnRepository.findAllByProjectId(projectId);
    const tasks = await this.taskRepository.findAllByProjectId(projectId);

    return {
      project,
      columns,
      tasks
    };
  }
}
