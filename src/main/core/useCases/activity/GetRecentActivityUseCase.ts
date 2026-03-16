import { ActivityLog } from "../../../../shared/schemas/models";
import { ActivityLogRepository } from "../../repositories/ActivityLogRepository";

export class GetRecentActivityUseCase {
  constructor(private activityLogRepository: ActivityLogRepository) {}

  async execute(limit = 50): Promise<ActivityLog[]> {
    return this.activityLogRepository.getRecent(limit);
  }
}
