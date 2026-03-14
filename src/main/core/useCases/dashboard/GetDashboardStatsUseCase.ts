import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IColumnRepository } from '../../domain/repositories/IColumnRepository';

export interface DashboardStats {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  recentActivity: {
    id: string;
    type: 'create' | 'move' | 'complete';
    taskTitle: string;
    timestamp: string;
    actor: 'user' | 'ai';
  }[];
}

export class GetDashboardStatsUseCase {
  constructor(
    private projectRepository: IProjectRepository,
    private columnRepository: IColumnRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(): Promise<DashboardStats> {
    const projects = await this.projectRepository.findAll();
    let allTasks = [];
    
    for (const project of projects) {
      const tasks = await this.taskRepository.findAllByProjectId(project.id);
      allTasks.push(...tasks);
    }

    // This is a simplified version. In a real app, we'd have an activity_logs table.
    // For now, we'll derive some stats from current tasks.
    
    const completedTasksCount = allTasks.filter(t => {
       // Find the column this task belongs to and check its title
       // Since we don't have columns here, we'll assume tasks in 'Completed' column are done
       // In a real repo, we'd join with columns
       return false; // Placeholder until we have a better way or join
    }).length;

    // For the sake of this prototype, let's mock the complex stats but keep counts real
    return {
      totalTasks: allTasks.length,
      inProgressTasks: Math.floor(allTasks.length * 0.4), // Mock ratio
      completedTasks: Math.floor(allTasks.length * 0.3), // Mock ratio
      priorityBreakdown: {
        high: Math.floor(allTasks.length * 0.2),
        medium: Math.floor(allTasks.length * 0.5),
        low: Math.floor(allTasks.length * 0.3),
      },
      recentActivity: [
        { id: '1', type: 'create', taskTitle: 'Implement SQLite', timestamp: new Date().toISOString(), actor: 'user' },
        { id: '2', type: 'move', taskTitle: 'Setup MCP', timestamp: new Date().toISOString(), actor: 'ai' },
      ]
    };
  }
}
