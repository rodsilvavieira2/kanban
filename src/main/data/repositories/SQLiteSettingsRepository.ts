import { DatabaseSync } from 'node:sqlite';
import { SettingsRepository } from '../../core/repositories/SettingsRepository';

export class SQLiteSettingsRepository implements SettingsRepository {
  constructor(private db: DatabaseSync) {}

  async get(key: string): Promise<string | null> {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key) as { value: string } | undefined;
    return result ? result.value : null;
  }

  async set(key: string, value: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = @value
    `);
    stmt.run({ key, value });
  }

  async getAll(): Promise<Record<string, string>> {
    const stmt = this.db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as { key: string; value: string }[];
    
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }
}
