import { Database } from 'better-sqlite3';
import { Task } from '../../../shared/schemas/models';
import { ITaskRepository } from '../../core/domain/repositories/ITaskRepository';

export class SQLiteTaskRepository implements ITaskRepository {
  constructor(private db: Database) {}

  async findAllByColumnId(columnId: string): Promise<Task[]> {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE column_id = ? ORDER BY "order" ASC');
    const rows = stmt.all(columnId) as Record<string, unknown>[];
    return rows.map(row => this.mapToEntity(row));
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
    return rows.map(row => this.mapToEntity(row));
  }

  async findById(id: string): Promise<Task | undefined> {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown>;

    if (!row) return undefined;
    return this.mapToEntity(row);
  }

  async save(task: Task): Promise<Task> {
    const { id, columnId, title, description, dueDate, order, timeSpentMinutes } = task;

    const existing = await this.findById(id);

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE tasks
        SET column_id = ?, title = ?, description = ?, due_date = ?, "order" = ?, time_spent_minutes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(columnId, title, description, dueDate, order, timeSpentMinutes, id);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO tasks (id, column_id, title, description, due_date, "order", time_spent_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, columnId, title, description, dueDate, order, timeSpentMinutes);
    }

    const task = await this.findById(id);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
  }

  async move(taskId: string, columnId: string, order: number): Promise<void> {
    const stmt = this.db.prepare('UPDATE tasks SET column_id = ?, "order" = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(columnId, order, taskId);
  }

  async reorder(tasks: { id: string; order: number }[]): Promise<void> {
    const updateStmt = this.db.prepare('UPDATE tasks SET "order" = ? WHERE id = ?');
    
    const transaction = this.db.transaction((data) => {
      for (const item of data) {
        updateStmt.run(item.order, item.id);
      }
    });

    transaction(tasks);
  }

  async incrementTimeSpent(taskId: string, minutes: number): Promise<void> {
    const stmt = this.db.prepare('UPDATE tasks SET time_spent_minutes = time_spent_minutes + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(minutes, taskId);
  }

  private mapToEntity(row: Record<string, unknown>): Task {
    return {
      id: row.id,
      columnId: row.column_id,
      title: row.title,
      description: row.description || '',
      dueDate: row.due_date || undefined,
      order: row.order,
      timeSpentMinutes: row.time_spent_minutes || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
