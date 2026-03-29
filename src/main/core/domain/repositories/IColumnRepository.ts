import { Column } from "../../../../shared/schemas/models";

export interface IColumnRepository {
  findAllByProjectId(projectId: string): Promise<Column[]>;
  findById(id: string): Promise<Column | undefined>;
  save(column: Column): Promise<Column>;
  update(id: string, title: string): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(columns: { id: string; order: number }[]): Promise<void>;
}
