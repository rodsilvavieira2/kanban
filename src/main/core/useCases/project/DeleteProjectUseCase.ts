import { IProjectRepository } from "../../domain/repositories/IProjectRepository";

export class DeleteProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error("Project ID is required");
    }
    return this.projectRepository.delete(id);
  }
}
