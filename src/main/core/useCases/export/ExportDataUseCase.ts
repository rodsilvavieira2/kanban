import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IColumnRepository } from '../../domain/repositories/IColumnRepository';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';

export interface ExportedTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  order: number;
  timeSpentMinutes: number;
  createdAt?: string;
}

export interface ExportedColumn {
  id: string;
  title: string;
  color?: string;
  order: number;
  tasks: ExportedTask[];
}

export interface ExportedProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  columns: ExportedColumn[];
}

export interface ExportPayload {
  exportedAt: string;
  version: string;
  projects: ExportedProject[];
}

export class ExportDataUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private columnRepository: IColumnRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(): Promise<ExportPayload> {
    const projects = await this.projectRepository.findAll();

    const exportedProjects: ExportedProject[] = await Promise.all(
      projects.map(async (project) => {
        const columns = await this.columnRepository.findAllByProjectId(project.id);

        const exportedColumns: ExportedColumn[] = await Promise.all(
          columns.map(async (column) => {
            const tasks = await this.taskRepository.findAllByColumnId(column.id);
            const exportedTasks: ExportedTask[] = tasks.map((task) => ({
              id: task.id,
              title: task.title,
              description: task.description || undefined,
              dueDate: task.dueDate || undefined,
              order: task.order,
              timeSpentMinutes: task.timeSpentMinutes,
              createdAt: task.createdAt || undefined,
            }));

            return {
              id: column.id,
              title: column.title,
              color: column.color || undefined,
              order: column.order,
              tasks: exportedTasks,
            };
          })
        );

        return {
          id: project.id,
          name: project.name,
          description: project.description || undefined,
          status: project.status || undefined,
          dueDate: project.dueDate || undefined,
          createdAt: project.createdAt || undefined,
          columns: exportedColumns,
        };
      })
    );

    return {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      projects: exportedProjects,
    };
  }
}
