import { Database } from 'better-sqlite3';
import { Project } from '../../../shared/schemas/models';
import { IProjectRepository } from '../../core/domain/repositories/IProjectRepository';

export class SQLiteProjectRepository implements IProjectRepository {
  constructor(private db: Database) {}

  async findAll(): Promise<Project[]> {
    const stmt = this.db.prepare(`
      SELECT p.*, 
      (SELECT COUNT(t.id) FROM tasks t INNER JOIN columns c ON t.column_id = c.id WHERE c.project_id = p.id) as tasksCount 
      FROM projects p
    `);
    
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(row => this.mapToEntity(row));
  }

  async findById(id: string): Promise<Project | undefined> {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
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
      stmt.run(name, description, status, dueDate, id);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO projects (id, name, description, status, due_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, name, description, status, dueDate);
    }
    
    const project = await this.findById(id);
    if (!project) throw new Error("Project not found");
    return project;
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
  }

  private mapToEntity(row: Record<string, unknown>): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      status: row.status as 'active' | 'archived',
      dueDate: row.due_date || undefined,
      progress: row.progress || 0,
      tasksCount: row.tasksCount || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
