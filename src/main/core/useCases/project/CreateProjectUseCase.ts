import { v4 as uuidv4 } from 'uuid';
import { Project } from '../../../../shared/schemas/models';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';

export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(projectData: Partial<Project>): Promise<Project> {
    if (!projectData.name) {
      throw new Error('Project name is required');
    }

    const project: Project = {
      id: uuidv4(),
      name: projectData.name,
      description: projectData.description || '',
      status: projectData.status || 'Planning',
      dueDate: projectData.dueDate,
      progress: 0,
      tasksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.projectRepository.save(project);
  }
}
