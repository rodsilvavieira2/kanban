import { IColumnRepository } from "../../domain/repositories/IColumnRepository";
import crypto from "node:crypto";

export class InitializeProjectColumnsUseCase {
  constructor(private columnRepository: IColumnRepository) {}

  async execute(projectId: string): Promise<void> {
    const defaultColumns = [
      { title: "Todo", order: 0, color: "todo" },
      { title: "In Progress", order: 1, color: "in-progress" },
      { title: "Completed", order: 2, color: "completed" },
    ];

    for (const col of defaultColumns) {
      await this.columnRepository.save({
        id: crypto.randomUUID(),
        projectId,
        title: col.title,
        order: col.order,
        color: col.color,
      });
    }
  }
}
