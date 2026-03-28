import crypto from "node:crypto";
import { Column } from "../../../../shared/schemas/models";
import { IColumnRepository } from "../../domain/repositories/IColumnRepository";

export class CreateColumnUseCase {
  constructor(private columnRepository: IColumnRepository) {}

  async execute(projectId: string, title: string): Promise<Column> {
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    if (!title || !title.trim()) {
      throw new Error("Column title is required");
    }

    const existingColumns = await this.columnRepository.findAllByProjectId(projectId);
    
    let maxOrder = -1;
    for (const col of existingColumns) {
      if (col.order > maxOrder) {
        maxOrder = col.order;
      }
    }

    const columnId = crypto.randomUUID();

    const column: Column = {
      id: columnId,
      projectId,
      title: title.trim(),
      order: maxOrder + 1,
      color: "new-column", // Optional default or omit
    };

    return await this.columnRepository.save(column);
  }
}
