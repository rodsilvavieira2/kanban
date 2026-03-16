import { Project } from "../../../../shared/schemas/models";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";

export class GetProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }
}
