import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Dashboard } from './components/Dashboard';
import { CreateProjectModal } from './components/CreateProjectModal';
import { Settings } from './components/Settings';
import { KanbanBoard } from './components/KanbanBoard';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'settings'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewChange = (view: 'dashboard' | 'projects' | 'settings') => {
    setCurrentView(view);
    setSelectedProject(null); // Reset selected project when changing views from sidebar
  };

  return (
    <>
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
      />
      {currentView === 'dashboard' && <Dashboard />}
      
      {currentView === 'projects' && !selectedProject && (
        <MainContent 
          onCreateProject={() => setIsModalOpen(true)} 
          onProjectSelect={setSelectedProject}
        />
      )}
      
      {currentView === 'projects' && selectedProject && (
        <KanbanBoard 
          projectTitle={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      )}
      
      {currentView === 'settings' && <Settings />}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
