import { Column } from "../../../../shared/schemas/models";

export interface IColumnRepository {
  findAllByProjectId(projectId: string): Promise<Column[]>;
  findById(id: string): Promise<Column | undefined>;
  save(column: Column): Promise<Column>;
  delete(id: string): Promise<void>;
  reorder(columns: { id: string; order: number }[]): Promise<void>;
}
