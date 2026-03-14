import React, { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Project } from '../services/projectService';

const mockColumns = [
  {
    id: 'col-todo',
    title: 'To Do',
    color: '#30abe8',
    tasks: [
      { id: 't1', title: 'Design System Update', labels: ['UI/UX', 'Design'], comments: 3, attachments: 2, date: 'Oct 24, 2023', daysLeft: 5 },
      { id: 't2', title: 'API Integration', labels: ['Backend', 'API'], comments: 5, attachments: 0, date: 'Oct 28, 2023', daysLeft: 9 },
    ]
  },
  {
    id: 'col-inprogress',
    title: 'In Progress',
    color: '#f59e0b',
    tasks: [
      { id: 't3', title: 'User Authentication', labels: ['Security', 'Frontend'], comments: 12, attachments: 1, date: 'Oct 20, 2023', daysLeft: 1 },
      { id: 't4', title: 'Database Migration', labels: ['Database', 'DevOps'], comments: 2, attachments: 4, date: 'Oct 22, 2023', daysLeft: 3 },
      { id: 't5', title: 'Payment Gateway Setup', labels: ['Backend', 'Finance'], comments: 8, attachments: 3, date: 'Nov 05, 2023', daysLeft: 17 }
    ]
  },
  {
    id: 'col-done',
    title: 'Done',
    color: '#10b981',
    tasks: [
      { id: 't6', title: 'Initial Project Setup', labels: ['Architecture'], comments: 0, attachments: 0, date: 'Sep 15, 2023', daysLeft: 0 },
      { id: 't7', title: 'Landing Page v1', labels: ['Frontend', 'Design'], comments: 15, attachments: 5, date: 'Oct 01, 2023', daysLeft: 0 }
    ]
  }
];

export function KanbanBoard() {
  const project = useLoaderData() as Project;
  const navigate = useNavigate();
  const [columns] = useState(mockColumns);

  if (!project) return <div>Project not found</div>;

  return (
    <div className="kanban-view">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button className="icon-button back-button" onClick={() => navigate('/projects')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2>{project.name}</h2>
        </div>
        <div className="kanban-header-right">
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Search tasks..." />
          </div>
          <button className="btn-primary" onClick={() => navigate(`/projects/${project.id}/tasks/new`)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Task
          </button>
        </div>
      </div>

      <div className="kanban-columns-container">
        {columns.map((column) => (
          <div className="kanban-column" key={column.id}>
            <div className="column-header">
              <div className="column-title">
                <span className="column-color-dot" style={{ backgroundColor: column.color }}></span>
                <h3>{column.title}</h3>
                <span className="task-count">{column.tasks.length}</span>
              </div>
              <button className="icon-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
              </button>
            </div>

            <div className="column-tasks">
              {column.tasks.map(task => (
                <div className="kanban-task-card" key={task.id}>
                  <div className="task-labels">
                    {task.labels.map(label => (
                      <span className="task-label" key={label}>{label}</span>
                    ))}
                  </div>
                  <h4 className="task-title">{task.title}</h4>
                  
                  <div className="task-meta">
                    <div className="task-meta-right">
                       <span className={`task-date ${task.daysLeft <= 3 && task.daysLeft > 0 ? 'warning' : ''} ${task.daysLeft === 0 && column.id !== 'col-done' ? 'danger' : ''}`}>
                         {task.date}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="add-task-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Task
            </button>
          </div>
        ))}
        
        <div className="add-column-placeholder">
          <button className="add-column-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Column</span>
          </button>
        </div>
      </div>
    </div>
  );
}
