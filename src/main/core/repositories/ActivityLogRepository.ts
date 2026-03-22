import { ActivityLog } from "../../../shared/schemas/models";

export interface ActivityLogRepository {
  create(log: Omit<ActivityLog, "id" | "createdAt">): Promise<ActivityLog>;
  getRecent(limit?: number): Promise<ActivityLog[]>;
}
