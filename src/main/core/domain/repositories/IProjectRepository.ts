import { Project } from '../../../../shared/schemas/models';

export interface IProjectRepository {
  /**
   * Retrieves all projects
   */
  findAll(): Promise<Project[]>;
  
  /**
   * Retrieves a specific project by its ID
   * @param id The unique identifier of the project
   */
  findById(id: string): Promise<Project | undefined>;
  
  /**
   * Creates or updates a project
   * @param project The project data to save
   */
  save(project: Project): Promise<Project>;
  
  /**
   * Deletes a project and all associated cascades (columns, tasks)
   * @param id The unique identifier of the project
   */
  delete(id: string): Promise<void>;
}
