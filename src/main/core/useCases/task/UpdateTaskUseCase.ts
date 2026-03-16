import { Task } from "../../../../shared/schemas/models";
import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { ActivityLogRepository } from "../../repositories/ActivityLogRepository";

export class UpdateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(taskId: string, taskData: Partial<Task>): Promise<Task> {
    const existingTask = await this.taskRepository.findById(taskId);

    if (!existingTask) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const updatedTask: Task = {
      ...existingTask,
      ...taskData,
      id: existingTask.id, // Ensure ID cannot be overridden
      updatedAt: new Date().toISOString(),
    };

    const savedTask = await this.taskRepository.save(updatedTask);

    await this.activityLogRepository.create({
      action: "Updated task",
      entityType: "Task",
      entityId: savedTask.id,
      details: `Updated task "${savedTask.title}"`,
    });

    return savedTask;
  }
}
