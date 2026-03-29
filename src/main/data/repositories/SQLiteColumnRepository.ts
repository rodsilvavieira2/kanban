import { DatabaseSync } from "node:sqlite";
import { Column } from "../../../shared/schemas/models";
import { IColumnRepository } from "../../core/domain/repositories/IColumnRepository";

export class SQLiteColumnRepository implements IColumnRepository {
  constructor(private db: DatabaseSync) {}

  async findAllByProjectId(projectId: string): Promise<Column[]> {
    const stmt = this.db.prepare(
      'SELECT * FROM columns WHERE project_id = ? ORDER BY "order" ASC',
    );
    const rows = stmt.all(projectId) as Record<string, unknown>[];
    return rows.map((row) => this.mapToEntity(row));
  }

  async findById(id: string): Promise<Column | undefined> {
    const stmt = this.db.prepare("SELECT * FROM columns WHERE id = ?");
    const row = stmt.get(id) as Record<string, unknown>;

    if (!row) return undefined;
    return this.mapToEntity(row);
  }

  async save(column: Column): Promise<Column> {
    const { id, projectId, title, color, order } = column;

    const existing = await this.findById(id);

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE columns
        SET title = ?, color = ?, "order" = ?
        WHERE id = ?
      `);
      stmt.run(title, color ?? null, order, id);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO columns (id, project_id, title, color, "order")
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, projectId, title, color ?? null, order);
    }

    const col = await this.findById(id);
    if (!col) throw new Error("Column not found");
    return col;
  }

  async update(id: string, title: string): Promise<void> {
    const stmt = this.db.prepare("UPDATE columns SET title = ? WHERE id = ?");
    stmt.run(title, id);
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM columns WHERE id = ?");
    stmt.run(id);
  }

  async reorder(columns: { id: string; order: number }[]): Promise<void> {
    const updateStmt = this.db.prepare(
      'UPDATE columns SET "order" = ? WHERE id = ?',
    );

    this.db.exec("BEGIN");
    try {
      for (const item of columns) {
        updateStmt.run(item.order, item.id);
      }
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  private mapToEntity(row: Record<string, unknown>): Column {
    return {
      id: row.id as string,
      projectId: row.project_id as string,
      title: row.title as string,
      color: (row.color as string) || undefined,
      order: row.order as number,
      createdAt: row.created_at as string | undefined,
    };
  }
}
