import crypto from "node:crypto";
import { Task } from "../../../../shared/schemas/models";
import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { ActivityLogRepository } from "../../repositories/ActivityLogRepository";

export class CreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(taskData: Partial<Task>): Promise<Task> {
    if (!taskData.title || !taskData.columnId) {
      throw new Error("Task title and column ID are required");
    }

    const tasksInColumn = await this.taskRepository.findAllByColumnId(
      taskData.columnId,
    );
    const order = tasksInColumn.length;

    const task: Task = {
      id: crypto.randomUUID(),
      columnId: taskData.columnId,
      title: taskData.title,
      description: taskData.description || "",
      dueDate: taskData.dueDate,
      order,
      timeSpentMinutes: 0,
      tags: taskData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedTask = await this.taskRepository.save(task);

    await this.activityLogRepository.create({
      action: "Created task",
      entityType: "Task",
      entityId: savedTask.id,
      details: `Created task "${savedTask.title}"`,
    });

    return savedTask;
  }
}
