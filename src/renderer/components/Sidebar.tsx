import React from 'react';
import * as Icons from '@geist-ui/icons';

interface SidebarProps {
  currentView: 'dashboard' | 'projects' | 'pomodoro' | 'settings';
  onViewChange: (view: 'dashboard' | 'projects' | 'pomodoro' | 'settings') => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Icons.Box size={18} strokeWidth={2} />
        </div>
        <span className="brand-title">TaskMaster</span>
      </div>

      <nav className="nav-menu">
        <a 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          <Icons.Grid size={18} strokeWidth={1.5} />
          Dashboard
        </a>
        <a 
          className={`nav-item ${currentView === 'projects' ? 'active' : ''}`}
          onClick={() => onViewChange('projects')}
        >
          <Icons.Layers size={18} strokeWidth={1.5} />
          Projects
        </a>
        <a 
          className={`nav-item ${currentView === 'pomodoro' ? 'active' : ''}`}
          onClick={() => onViewChange('pomodoro')}
        >
          <Icons.Clock size={18} strokeWidth={1.5} />
          Pomodoro
        </a>
      </nav>

      <div style={{ marginTop: 'auto', padding: '24px' }}>
        <button 
          className={`btn-secondary ${currentView === 'settings' ? 'active' : ''}`} 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onViewChange('settings')}
        >
          <Icons.Settings size={18} strokeWidth={1.5} />
          Settings
        </button>
      </div>
    </aside>
  );
}