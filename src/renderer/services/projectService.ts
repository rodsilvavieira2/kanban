// Type definition for the window extension
declare global {
  interface Window {
    kanbanApi: any;
  }
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'In Progress' | 'Completed' | 'Planning';
  dueDate: string;
  tasksCount: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Mobile App Redesign',
    description: 'Overhaul the UI/UX for the iOS and Android applications to improve user engagement.',
    progress: 65,
    status: 'In Progress',
    dueDate: 'Nov 30, 2023',
    tasksCount: 24,
  },
  {
    id: '2',
    name: 'Q4 Marketing Campaign',
    description: 'Planning and execution of the end-of-year marketing initiatives.',
    progress: 100,
    status: 'Completed',
    dueDate: 'Oct 15, 2023',
    tasksCount: 12,
  },
];

export async function getProjects(): Promise<Project[]> {
  try {
    if (window.kanbanApi && window.kanbanApi.getProjects) {
      const dbProjects = await window.kanbanApi.getProjects();
      // Map SQLite snake_case back to frontend camelCase if necessary
      return dbProjects.map((p: any) => ({
        ...p,
        dueDate: p.due_date,
        // Calculate a dummy progress for now or default it
        progress: 0,
        tasksCount: p.tasksCount || 0
      }));
    }
  } catch (error) {
    console.error("IPC not available or failed, falling back to mocks", error);
  }
  // Fallback if running outside of Electron or prior to ContextBridge loading
  return mockProjects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find(p => p.id === id);
}

export async function getAvailableTags(): Promise<string[]> {
  // Mock tags based on the initial default tasks in KanbanBoard
  const defaultTags = ['UI/UX', 'Design', 'Backend', 'Frontend', 'Security', 'Database', 'API', 'Finance', 'Architecture', 'DevOps'];
  return new Promise((resolve) => {
    setTimeout(() => resolve(defaultTags), 100);
  });
}
