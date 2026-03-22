import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { ActivityLogRepository } from "../../repositories/ActivityLogRepository";

export class UpdateTaskTimeUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(taskId: string, minutes: number): Promise<void> {
    if (minutes <= 0) {
      return;
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    await this.taskRepository.incrementTimeSpent(taskId, minutes);

    await this.activityLogRepository.create({
      action: "Logged time",
      entityType: "Task",
      entityId: taskId,
      details: `Added ${minutes} minute${minutes === 1 ? "" : "s"} to "${task.title}"`,
    });
  }
}
