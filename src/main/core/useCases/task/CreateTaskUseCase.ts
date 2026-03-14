import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../../../shared/schemas/models';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskData: Partial<Task>): Promise<Task> {
    if (!taskData.title || !taskData.columnId) {
      throw new Error('Task title and column ID are required');
    }

    const tasksInColumn = await this.taskRepository.findAllByColumnId(taskData.columnId);
    const order = tasksInColumn.length;

    const task: Task = {
      id: uuidv4(),
      columnId: taskData.columnId,
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate,
      order,
      timeSpentMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.taskRepository.save(task);
  }
}
