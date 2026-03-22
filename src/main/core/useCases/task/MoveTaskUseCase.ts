import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { ActivityLogRepository } from "../../repositories/ActivityLogRepository";

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

      // Remove from source and reorder the remaining source tasks
      const [movedTask] = sourceTasks.splice(sourceIndex, 1);
      await this.taskRepository.reorder(
        sourceTasks.map((task, index) => ({ id: task.id, order: index })),
      );

      // Update the moved task's column_id and final order via move()
      // Then reorder all destination tasks (including the moved one) for consistency.
      // Insert the local movedTask object at the target index to compute correct orders,
      // avoiding an extra findById() DB round-trip.
      destinationTasks.splice(destinationIndex, 0, movedTask);

      // move() sets column_id and order for the moved task
      await this.taskRepository.move(
        taskId,
        destinationColumnId,
        destinationIndex,
      );

      // reorder() updates only the *other* destination tasks that shifted positions;
      // the moved task's order was already set correctly by move() above.
      const otherDestTasks = destinationTasks
        .filter((t) => t.id !== taskId)
        .map((task, index) => ({
          id: task.id,
          order: index < destinationIndex ? index : index + 1,
        }));
      await this.taskRepository.reorder(otherDestTasks);
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
