import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useSettingsStore } from '../stores/settingsStore';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const loadSettings = useSettingsStore(state => state.loadSettings);
  const theme = useSettingsStore(state => state.settings.theme);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else if (theme === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      // System default
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    }
  }, [theme]);

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
