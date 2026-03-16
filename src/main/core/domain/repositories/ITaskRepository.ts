import { Task } from "../../../../shared/schemas/models";

export interface ITaskRepository {
  findAllByColumnId(columnId: string): Promise<Task[]>;
  findAllByProjectId(projectId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | undefined>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  move(taskId: string, columnId: string, order: number): Promise<void>;
  reorder(tasks: { id: string; order: number }[]): Promise<void>;
  incrementTimeSpent(taskId: string, minutes: number): Promise<void>;
}
