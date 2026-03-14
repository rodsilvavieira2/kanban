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
  {
    id: '3',
    name: 'API V2 Migration',
    description: 'Migrating legacy endpoints to the new GraphQL architecture.',
    progress: 30,
    status: 'In Progress',
    dueDate: 'Dec 10, 2023',
    tasksCount: 45,
  },
  {
    id: '4',
    name: 'Brand Refresh',
    description: 'Updating company brand guidelines and marketing assets.',
    progress: 0,
    status: 'Planning',
    dueDate: 'Jan 15, 2024',
    tasksCount: 8,
  }
];

export async function getProjects(): Promise<Project[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProjects), 100);
  });
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProjects.find(p => p.id === id)), 50);
  });
}

export async function getAvailableTags(): Promise<string[]> {
  // Mock tags based on the initial default tasks in KanbanBoard
  const defaultTags = ['UI/UX', 'Design', 'Backend', 'Frontend', 'Security', 'Database', 'API', 'Finance', 'Architecture', 'DevOps'];
  return new Promise((resolve) => {
    setTimeout(() => resolve(defaultTags), 100);
  });
}
