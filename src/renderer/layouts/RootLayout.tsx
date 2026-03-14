import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { CreateProjectModal } from '../components/CreateProjectModal';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine current view for Sidebar highlighting
  let currentView: 'dashboard' | 'projects' | 'pomodoro' | 'settings' = 'dashboard';
  if (location.pathname === '/settings') currentView = 'settings';
  else if (location.pathname === '/pomodoro') currentView = 'pomodoro';
  else if (location.pathname.startsWith('/projects')) currentView = 'projects';

  return (
    <>
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => navigate(`/${view === 'dashboard' ? '' : view}`)} 
      />
      <Outlet context={{ openModal: () => setIsModalOpen(true) }} />
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
