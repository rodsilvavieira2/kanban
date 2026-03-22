import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import { ActivityLog } from "../../../shared/schemas/models";
import { ActivityLogRepository } from "../../core/repositories/ActivityLogRepository";

export class SQLiteActivityLogRepository implements ActivityLogRepository {
  constructor(private db: DatabaseSync) {}

  async create(
    log: Omit<ActivityLog, "id" | "createdAt">,
  ): Promise<ActivityLog> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO activity_logs (id, action, entity_type, entity_id, details, created_at)
      VALUES (@id, @action, @entityType, @entityId, @details, @createdAt)
    `);

    stmt.run({
      id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details || null,
      createdAt,
    });

    return {
      id,
      ...log,
      createdAt,
    };
  }

  async getRecent(limit = 50): Promise<ActivityLog[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        action, 
        entity_type as entityType, 
        entity_id as entityId, 
        details, 
        created_at as createdAt
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(limit) as ActivityLog[];
  }

  async getByEntity(
    entityType: string,
    entityId: string,
  ): Promise<ActivityLog[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        action, 
        entity_type as entityType, 
        entity_id as entityId, 
        details, 
        created_at as createdAt
      FROM activity_logs
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC
    `);

    return stmt.all(entityType, entityId) as ActivityLog[];
  }
}
