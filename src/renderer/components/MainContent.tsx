import React from 'react';

interface MainContentProps {
  onCreateProject?: () => void;
}

export function MainContent({ onCreateProject }: MainContentProps) {
  return (
    <main className="main-content">
      <div className="top-header">
        <h1>Projects</h1>
      </div>
      
      <div className="empty-state">
        <div className="empty-state-illustration">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
        </div>
        <h3>No projects yet</h3>
        <p>Organize your tasks and streamline your workflow by creating your first project container today.</p>
        <button className="btn-primary" onClick={onCreateProject}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Your First Project
        </button>
      </div>
    </main>
  );
}
