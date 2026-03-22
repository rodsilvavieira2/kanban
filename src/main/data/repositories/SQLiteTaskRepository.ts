import { DatabaseSync } from "node:sqlite";
import { Task } from "../../../shared/schemas/models";
import { ITaskRepository } from "../../core/domain/repositories/ITaskRepository";
import crypto from "crypto";

export class SQLiteTaskRepository implements ITaskRepository {
  constructor(private db: DatabaseSync) {}

  private getTagsForTask(taskId: string): string[] {
    const stmt = this.db.prepare(`
      SELECT t.name FROM tags t
      INNER JOIN task_tags tt ON t.id = tt.tag_id
      WHERE tt.task_id = ?
    `);
    const rows = stmt.all(taskId) as { name: string }[];
    return rows.map((r) => r.name);
  }

  async findAllByColumnId(columnId: string): Promise<Task[]> {
    const stmt = this.db.prepare(
      'SELECT * FROM tasks WHERE column_id = ? ORDER BY "order" ASC',
    );
    const rows = stmt.all(columnId) as Record<string, unknown>[];
    return rows.map((row) =>
      this.mapToEntity(row, this.getTagsForTask(row.id as string)),
    );
  }

  async findAllByProjectId(projectId: string): Promise<Task[]> {
    const stmt = this.db.prepare(`
      SELECT t.* 
      FROM tasks t 
      INNER JOIN columns c ON t.column_id = c.id 
      WHERE c.project_id = ? 
      ORDER BY c."order" ASC, t."order" ASC
    `);
    const rows = stmt.all(projectId) as Record<string, unknown>[];
    return rows.map((row) =>
      this.mapToEntity(row, this.getTagsForTask(row.id as string)),
    );
  }

  async findById(id: string): Promise<Task | undefined> {
    const stmt = this.db.prepare("SELECT * FROM tasks WHERE id = ?");
    const row = stmt.get(id) as Record<string, unknown>;

    if (!row) return undefined;
    return this.mapToEntity(row, this.getTagsForTask(id));
  }

  async save(task: Task): Promise<Task> {
    const {
      id,
      columnId,
      title,
      description,
      dueDate,
      order,
      timeSpentMinutes,
      tags,
    } = task;

    const existing = await this.findById(id);

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE tasks
        SET column_id = ?, title = ?, description = ?, due_date = ?, "order" = ?, time_spent_minutes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        columnId,
        title,
        description ?? null,
        dueDate ?? null,
        order,
        timeSpentMinutes,
        id,
      );
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO tasks (id, column_id, title, description, due_date, "order", time_spent_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        columnId,
        title,
        description ?? null,
        dueDate ?? null,
        order,
        timeSpentMinutes,
      );
    }

    if (tags) {
      this.db.prepare("DELETE FROM task_tags WHERE task_id = ?").run(id);

      const insertTagStmt = this.db.prepare(
        "INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)",
      );
      const getTagStmt = this.db.prepare("SELECT id FROM tags WHERE name = ?");
      const insertTaskTagStmt = this.db.prepare(
        "INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)",
      );

      for (const tagName of tags) {
        const normalizedTag = tagName.trim();
        if (!normalizedTag) continue;

        const tagId = crypto.randomUUID();
        insertTagStmt.run(tagId, normalizedTag);

        const row = getTagStmt.get(normalizedTag) as { id: string };
        if (row && row.id) {
          insertTaskTagStmt.run(id, row.id);
        }
      }
    }

    const saved = await this.findById(id);
    if (!saved) throw new Error("Task not found");
    return saved;
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM tasks WHERE id = ?");
    stmt.run(id);
  }

  async move(taskId: string, columnId: string, order: number): Promise<void> {
    const stmt = this.db.prepare(
      'UPDATE tasks SET column_id = ?, "order" = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    );
    stmt.run(columnId, order, taskId);
  }

  async reorder(tasks: { id: string; order: number }[]): Promise<void> {
    const updateStmt = this.db.prepare(
      'UPDATE tasks SET "order" = ? WHERE id = ?',
    );

    this.db.exec("BEGIN");
    try {
      for (const item of tasks) {
        updateStmt.run(item.order, item.id);
      }
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  async incrementTimeSpent(taskId: string, minutes: number): Promise<void> {
    const stmt = this.db.prepare(
      "UPDATE tasks SET time_spent_minutes = time_spent_minutes + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    );
    stmt.run(minutes, taskId);
  }

  private mapToEntity(row: Record<string, unknown>, tags: string[] = []): Task {
    return {
      id: row.id as string,
      columnId: row.column_id as string,
      title: row.title as string,
      description: (row.description as string) || "",
      dueDate: (row.due_date as string) || undefined,
      order: row.order as number,
      timeSpentMinutes: (row.time_spent_minutes as number) || 0,
      tags,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
