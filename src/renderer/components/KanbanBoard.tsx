import React, { useState } from 'react';

// Mock data types and items
const mockColumns = [
  {
    id: 'col-todo',
    title: 'To Do',
    color: '#30abe8', // var(--accent-color)
    tasks: [
      { id: 't1', title: 'Design System Update', labels: ['UI/UX', 'Design'], comments: 3, attachments: 2, date: 'Oct 24, 2023', daysLeft: 5 },
      { id: 't2', title: 'API Integration', labels: ['Backend', 'API'], comments: 5, attachments: 0, date: 'Oct 28, 2023', daysLeft: 9 },
    ]
  },
  {
    id: 'col-inprogress',
    title: 'In Progress',
    color: '#f59e0b', // orange/amber
    tasks: [
      { id: 't3', title: 'User Authentication', labels: ['Security', 'Frontend'], comments: 12, attachments: 1, date: 'Oct 20, 2023', daysLeft: 1 },
      { id: 't4', title: 'Database Migration', labels: ['Database', 'DevOps'], comments: 2, attachments: 4, date: 'Oct 22, 2023', daysLeft: 3 },
      { id: 't5', title: 'Payment Gateway Setup', labels: ['Backend', 'Finance'], comments: 8, attachments: 3, date: 'Nov 05, 2023', daysLeft: 17 }
    ]
  },
  {
    id: 'col-done',
    title: 'Done',
    color: '#10b981', // emerald/green
    tasks: [
      { id: 't6', title: 'Initial Project Setup', labels: ['Architecture'], comments: 0, attachments: 0, date: 'Sep 15, 2023', daysLeft: 0 },
      { id: 't7', title: 'Landing Page v1', labels: ['Frontend', 'Design'], comments: 15, attachments: 5, date: 'Oct 01, 2023', daysLeft: 0 }
    ]
  }
];

interface KanbanBoardProps {
  projectTitle: string;
  onBack: () => void;
}

export function KanbanBoard({ projectTitle, onBack }: KanbanBoardProps) {
  const [columns] = useState(mockColumns);

  return (
    <div className="kanban-view">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button className="icon-button back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2>{projectTitle}</h2>
        </div>
        <div className="kanban-header-right">
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Search tasks..." />
          </div>
          <button className="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter
          </button>
          <button className="icon-button">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </div>
      </div>

      <div className="kanban-tabs">
        <div className="kanban-tab active">Board</div>
        <div className="kanban-tab">List</div>
        <div className="kanban-tab">Timeline</div>
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
                    <div className="task-meta-left">
                       {task.comments > 0 && (
                        <div className="meta-item">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                           <span>{task.comments}</span>
                        </div>
                       )}
                       {task.attachments > 0 && (
                        <div className="meta-item">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                           <span>{task.attachments}</span>
                        </div>
                       )}
                    </div>
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