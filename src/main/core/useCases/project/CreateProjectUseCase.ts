import crypto from "node:crypto";
import { Project } from "../../../../shared/schemas/models";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { InitializeProjectColumnsUseCase } from "../column/InitializeProjectColumnsUseCase";

export class CreateProjectUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private initializeColumnsUseCase: InitializeProjectColumnsUseCase,
  ) {}

  async execute(projectData: Partial<Project>): Promise<Project> {
    if (!projectData.name) {
      throw new Error("Project name is required");
    }

    const projectId = crypto.randomUUID();

    const project: Project = {
      id: projectId,
      name: projectData.name,
      description: projectData.description || "",
      status: projectData.status || "Planning",
      dueDate: projectData.dueDate,
      progress: 0,
      tasksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedProject = await this.projectRepository.save(project);

    // Initialize default columns for the new project
    await this.initializeColumnsUseCase.execute(projectId);

    return savedProject;
  }
}
