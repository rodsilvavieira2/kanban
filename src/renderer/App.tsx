import { createHashRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { Dashboard } from './components/Dashboard';
import { ProjectsList } from './components/ProjectsList';
import { KanbanBoard } from './components/KanbanBoard';
import { CreateTask } from './components/CreateTask';
import { Settings } from './components/Settings';
import { Pomodoro } from './components/Pomodoro';

const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'pomodoro',
        element: <Pomodoro />,
      },
      {
        path: 'projects',
        element: <ProjectsList />,
      },
      {
        path: 'projects/:projectId',
        element: <KanbanBoard />,
      },
      {
        path: 'projects/:projectId/tasks/new',
        element: <CreateTask />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
