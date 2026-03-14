import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { ConfirmDialog } from './ConfirmDialog';

export function ProjectsList() {
  const { projects, isLoading, loadProjects } = useProjectStore();
  const navigate = useNavigate();
  const { openModal } = useOutletContext<{ openModal: () => void }>();
  
  const deleteProject = useProjectStore(state => state.deleteProject);
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    variant: 'primary' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => undefined,
    variant: 'primary'
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Navigate to the board for now (edit modal can be added later)
    navigate(`/projects/${id}`);
    setOpenDropdownId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const project = projects.find(p => p.id === id);
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project?.name || 'this project'}"? This will permanently remove the project, its columns, and all tasks. This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteProject(id);
        } catch (err) {
          console.error('Failed to delete project', err);
        }
        closeConfirm();
      },
      variant: 'danger'
    });
    setOpenDropdownId(null);
  };

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Computed stats from real data
  const activeCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const totalCount = projects.length;

  if (isLoading && projects.length === 0) {
    return (
      <main className="main-content">
        <div className="top-header">
          <h1>Projects</h1>
        </div>
        <div className="empty-state">
          <p style={{ color: 'var(--text-secondary)' }}>Loading projects…</p>
        </div>
      </main>
    );
  }

  if (projects.length === 0) {
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
          <button className="btn-primary" onClick={openModal}>
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

  return (
    <main className="main-content">
      <div className="top-header projects-header">
        <div className="projects-header-left">
          <div className="projects-title-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1>Projects</h1>
        </div>
        <div className="projects-header-actions">
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Search projects..." />
          </div>
          <button className="btn-primary" onClick={openModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </button>
        </div>
      </div>
      
      <div className="projects-scrollable-content">
        <div className="projects-summary-cards">
          <div className="project-summary-card">
            <div className="summary-card-icon in-progress">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="summary-card-info">
              <span className="summary-value">{activeCount}</span>
              <span className="summary-label">Active Projects</span>
            </div>
          </div>
          <div className="project-summary-card">
            <div className="summary-card-icon completed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="summary-card-info">
              <span className="summary-value">{completedCount}</span>
              <span className="summary-label">Completed</span>
            </div>
          </div>
          <div className="project-summary-card">
            <div className="summary-card-icon on-hold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div className="summary-card-info">
              <span className="summary-value">{totalCount}</span>
              <span className="summary-label">Total Projects</span>
            </div>
          </div>
        </div>

        <div className="projects-list-container">
          <div className="projects-list-header">
            <h3>All Projects</h3>
            <div className="projects-list-filters">
              <button className="btn-secondary filter-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filter
              </button>
              <button className="btn-secondary filter-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                Sort
              </button>
            </div>
          </div>

          <div className="projects-table">
            <div className="projects-table-head">
              <div className="table-cell col-name">Project Name</div>
              <div className="table-cell col-status">Status</div>
              <div className="table-cell col-progress">Progress</div>
              <div className="table-cell col-due">Due Date</div>
              <div className="table-cell col-tasks">Tasks</div>
              <div className="table-cell col-actions"></div>
            </div>
            
            <div className="projects-table-body">
              {projects.map((project) => (
                <div 
                  className="projects-table-row" 
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="table-cell col-name">
                    <div className="project-icon-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div className="project-name-info">
                      <h4>{project.name}</h4>
                      <p>{project.description}</p>
                    </div>
                  </div>
                  <div className="table-cell col-status">
                    <span className={`status-badge ${(project.status || 'planning').toLowerCase().replace(' ', '-')}`}>
                      {project.status || 'Planning'}
                    </span>
                  </div>
                  <div className="table-cell col-progress">
                    <div className="progress-cell-wrapper">
                      <div className="progress-bar-small">
                        <div className={`progress ${project.progress === 100 ? 'completed' : 'active'}`} style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="table-cell col-due">
                    <span className="due-date-text">{project.dueDate || '—'}</span>
                  </div>
                  <div className="table-cell col-tasks">
                    <span className="tasks-count">{project.tasksCount}</span>
                  </div>
                  <div className="table-cell col-actions">
                    <div className="options-dropdown-container" ref={openDropdownId === project.id ? dropdownRef : null}>
                      <button className="icon-button" onClick={(e) => toggleDropdown(e, project.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                      </button>
                      {openDropdownId === project.id && (
                        <div className="options-dropdown">
                          <button className="dropdown-item" onClick={(e) => handleEdit(e, project.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit
                          </button>
                          <button className="dropdown-item delete" onClick={(e) => handleDelete(e, project.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="projects-pagination">
            <span className="pagination-info">Showing <b>{projects.length}</b> of <b>{projects.length}</b> projects</span>
            <div className="pagination-controls">
              <button className="pagination-btn disabled">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn disabled">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />
    </main>
  );
}
