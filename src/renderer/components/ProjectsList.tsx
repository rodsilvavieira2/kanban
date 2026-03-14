import React from 'react';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import { Project } from '../services/projectService';

export function ProjectsList() {
  const projects = useLoaderData() as Project[];
  const navigate = useNavigate();
  const { openModal } = useOutletContext<{ openModal: () => void }>();

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
              <span className="summary-value">4</span>
              <span className="summary-label">Active Projects</span>
            </div>
          </div>
          <div className="project-summary-card">
            <div className="summary-card-icon completed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="summary-card-info">
              <span className="summary-value">12</span>
              <span className="summary-label">Completed</span>
            </div>
          </div>
          <div className="project-summary-card">
            <div className="summary-card-icon on-hold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div className="summary-card-info">
              <span className="summary-value">2</span>
              <span className="summary-label">At Risk / Overdue</span>
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
                    <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
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
                    <span className="due-date-text">{project.dueDate}</span>
                  </div>
                  <div className="table-cell col-tasks">
                    <span className="tasks-count">{project.tasksCount}</span>
                  </div>
                  <div className="table-cell col-actions">
                    <button className="icon-button" onClick={(e) => e.stopPropagation()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
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
    </main>
  );
}
