import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Dashboard } from './components/Dashboard';
import { CreateProjectModal } from './components/CreateProjectModal';
import { Settings } from './components/Settings';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'projects' && <MainContent onCreateProject={() => setIsModalOpen(true)} />}
      {currentView === 'settings' && <Settings />}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
