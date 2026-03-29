import { IColumnRepository } from "../../domain/repositories/IColumnRepository";

export class EditColumnUseCase {
  constructor(private columnRepository: IColumnRepository) {}

  async execute(id: string, title: string): Promise<void> {
    if (!id) {
      throw new Error("Column ID is required");
    }
    if (!title || !title.trim()) {
      throw new Error("Column title is required");
    }

    await this.columnRepository.update(id, title.trim());
  }
}
