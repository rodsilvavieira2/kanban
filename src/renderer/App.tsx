import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Dashboard } from './components/Dashboard';
import { CreateProjectModal } from './components/CreateProjectModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onCreateProject={() => setIsModalOpen(true)}
      />
      {currentView === 'dashboard' ? <Dashboard /> : <MainContent onCreateProject={() => setIsModalOpen(true)} />}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
