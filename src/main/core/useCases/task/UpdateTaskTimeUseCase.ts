import { ITaskRepository } from '../../domain/repositories/ITaskRepository';

export class UpdateTaskTimeUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, minutes: number): Promise<void> {
    if (minutes <= 0) {
      return;
    }
    
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    await this.taskRepository.incrementTimeSpent(taskId, minutes);
  }
}
