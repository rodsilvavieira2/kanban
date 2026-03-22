import { DatabaseSync } from 'node:sqlite';
import { Project } from '../../../shared/schemas/models';
import { IProjectRepository } from '../../core/domain/repositories/IProjectRepository';

export class SQLiteProjectRepository implements IProjectRepository {
  constructor(private db: DatabaseSync) {}

  async findAll(): Promise<Project[]> {
    const stmt = this.db.prepare(`
      SELECT 
        p.*, 
        (SELECT COUNT(t.id) FROM tasks t INNER JOIN columns c ON t.column_id = c.id WHERE c.project_id = p.id) as tasksCount,
        (SELECT COUNT(t.id) FROM tasks t INNER JOIN columns c ON t.column_id = c.id WHERE c.project_id = p.id AND c."order" = (SELECT MIN("order") FROM columns WHERE project_id = p.id)) as todoCount,
        (SELECT COUNT(t.id) FROM tasks t INNER JOIN columns c ON t.column_id = c.id WHERE c.project_id = p.id AND c."order" = (SELECT MAX("order") FROM columns WHERE project_id = p.id)) as completedCount
      FROM projects p
    `);
    
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(row => this.mapToEntity(row));
  }

  async findById(id: string): Promise<Project | undefined> {
    const stmt = this.db.prepare(`
      SELECT 
        p.*, 
        (SELECT COUNT(t.id) FROM tasks t INNER JOIN columns c ON t.column_id = c.id WHERE c.project_id = p.id) as tasksCount,
        (SELECT COUNT(t.id) FROM tasks t INNER JOIN columns c ON t.column_id = c.id WHERE c.project_id = p.id AND c."order" = (SELECT MIN("order") FROM columns WHERE project_id = p.id)) as todoCount,
        (SELECT COUNT(t.id) FROM tasks t INNER JOIN columns c ON t.column_id = c.id WHERE c.project_id = p.id AND c."order" = (SELECT MAX("order") FROM columns WHERE project_id = p.id)) as completedCount
      FROM projects p
      WHERE p.id = ?
    `);
    const row = stmt.get(id) as Record<string, unknown>;
    
    if (!row) return undefined;
    return this.mapToEntity(row);
  }

  async save(project: Project): Promise<Project> {
    const { id, name, description, status, dueDate } = project;
    
    const existing = await this.findById(id);
    
    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE projects 
        SET name = ?, description = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(name, description ?? null, status, dueDate ?? null, id);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO projects (id, name, description, status, due_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, name, description ?? null, status, dueDate ?? null);
    }
    
    const output = await this.findById(id);
    if (!output) throw new Error("Project not found");
    return output;
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
  }

  private mapToEntity(row: Record<string, unknown>): Project {
    const tasksCount = (row.tasksCount as number) || 0;
    const todoCount = (row.todoCount as number) || 0;
    const completedCount = (row.completedCount as number) || 0;

    let calculatedStatus: "Planning" | "In Progress" | "Completed" = "Planning";
    let calculatedProgress = 0;

    if (tasksCount > 0) {
      calculatedProgress = Math.round((completedCount / tasksCount) * 100);
      
      if (completedCount === tasksCount) {
        calculatedStatus = "Completed";
      } else if (todoCount === tasksCount) {
        calculatedStatus = "Planning";
      } else {
        calculatedStatus = "In Progress";
      }
    } else {
      // If no tasks, fallback to the status stored in DB or default to Planning
      const dbStatus = row.status as string;
      if (dbStatus === "Completed" || dbStatus === "In Progress" || dbStatus === "Planning") {
        calculatedStatus = dbStatus as "Planning" | "In Progress" | "Completed";
      }
    }

    return {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string) || '',
      status: calculatedStatus,
      dueDate: (row.due_date as string) || undefined,
      progress: calculatedProgress,
      tasksCount: tasksCount,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
