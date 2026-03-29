import { IColumnRepository } from "../../domain/repositories/IColumnRepository";

export class DeleteColumnUseCase {
  constructor(private columnRepository: IColumnRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error("Column ID is required");
    }

    await this.columnRepository.delete(id);
  }
}
