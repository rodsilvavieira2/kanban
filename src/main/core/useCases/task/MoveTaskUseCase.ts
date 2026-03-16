import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { ActivityLogRepository } from "../repositories/ActivityLogRepository";

export interface MoveTaskRequest {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export class MoveTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(request: MoveTaskRequest): Promise<void> {
    const {
      taskId,
      sourceColumnId,
      destinationColumnId,
      sourceIndex,
      destinationIndex,
    } = request;

    if (sourceColumnId === destinationColumnId) {
      // Reorder within the same column
      const tasks = await this.taskRepository.findAllByColumnId(sourceColumnId);

      const movedTask = tasks.splice(sourceIndex, 1)[0];
      tasks.splice(destinationIndex, 0, movedTask);

      await this.taskRepository.reorder(
        tasks.map((task, index) => ({ id: task.id, order: index })),
      );
    } else {
      // Move between columns
      const sourceTasks =
        await this.taskRepository.findAllByColumnId(sourceColumnId);
      const destinationTasks =
        await this.taskRepository.findAllByColumnId(destinationColumnId);

      // Remove from source
      sourceTasks.splice(sourceIndex, 1);
      await this.taskRepository.reorder(
        sourceTasks.map((task, index) => ({ id: task.id, order: index })),
      );

      // Update destination order
      await this.taskRepository.move(
        taskId,
        destinationColumnId,
        destinationIndex,
      );

      // Update other tasks in destination
      destinationTasks.splice(
        destinationIndex,
        0,
        (await this.taskRepository.findById(taskId))!,
      );
      await this.taskRepository.reorder(
        destinationTasks.map((task, index) => ({ id: task.id, order: index })),
      );
    }
    if (sourceColumnId !== destinationColumnId) {
      const task = await this.taskRepository.findById(taskId);
      if (task) {
        await this.activityLogRepository.create({
          action: "Moved task",
          entityType: "Task",
          entityId: taskId,
          details: `Moved task "${task.title}" to a different column`,
        });
      }
    }
  }
}
