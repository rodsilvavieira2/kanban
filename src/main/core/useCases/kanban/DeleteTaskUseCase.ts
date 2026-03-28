import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { ActivityLogRepository } from "../../repositories/ActivityLogRepository";

export class DeleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(taskId: string): Promise<void> {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    await this.taskRepository.delete(taskId);

    if (task.projectId) {
      await this.activityLogRepository.create({
        action: "delete_task",
        entityType: "task",
        entityId: task.id,
        details: `Deleted task: "${task.title}"`,
      });
    }
  }
}
