import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { Dashboard } from './components/Dashboard';
import { ProjectsList } from './components/ProjectsList';
import { KanbanBoard } from './components/KanbanBoard';
import { CreateTask } from './components/CreateTask';
import { Settings } from './components/Settings';
import { Pomodoro } from './components/Pomodoro';
import { getProjects, getProjectById } from './services/projectService';

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
        loader: async () => {
          return getProjects();
        },
      },
      {
        path: 'projects/:projectId',
        element: <KanbanBoard />,
        loader: async ({ params }) => {
          if (!params.projectId) {
            throw new Response("Project ID Required", { status: 400 });
          }
          const project = await getProjectById(params.projectId);
          if (!project) {
            throw new Response("Not Found", { status: 404 });
          }
          return project;
        },
      },
      {
        path: 'projects/:projectId/tasks/new',
        element: <CreateTask />,
        loader: async ({ params }) => {
          if (!params.projectId) {
            throw new Response("Project ID Required", { status: 400 });
          }
          const project = await getProjectById(params.projectId);
          if (!project) {
            throw new Response("Not Found", { status: 404 });
          }
          return project;
        },
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
