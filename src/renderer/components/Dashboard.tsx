import React from 'react';

export function Dashboard() {
  return (
    <main className="main-content">
      <div className="top-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="dashboard-content">
        {/* Task Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <div className="card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h4>Total Tasks</h4>
            <h2>128</h2>
            <p className="trend positive">↑ 12% this week</p>
          </div>
          <div className="card">
            <div className="card-header in-progress">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h4>In Progress</h4>
            <h2>32</h2>
            <p className="trend neutral">→ 0% this week</p>
          </div>
          <div className="card">
            <div className="card-header completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h4>Completed</h4>
            <h2>84</h2>
            <p className="trend positive">↑ 8% this week</p>
          </div>
        </div>

        <div className="dashboard-lower">
          {/* Priority Breakdown */}
          <div className="priority-breakdown">
            <h3>Priority Breakdown</h3>
            <div className="priority-item">
              <div className="priority-info">
                <span>High</span>
                <span>12</span>
              </div>
              <div className="progress-bar">
                <div className="progress high" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div className="priority-item">
              <div className="priority-info">
                <span>Medium</span>
                <span>45</span>
              </div>
              <div className="progress-bar">
                <div className="progress medium" style={{ width: '50%' }}></div>
              </div>
            </div>
            <div className="priority-item">
              <div className="priority-info">
                <span>Low</span>
                <span>27</span>
              </div>
              <div className="progress-bar">
                <div className="progress low" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="activity-feed">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon update"></div>
                <div className="activity-content">
                  <p>Task <strong>"Design Mockups"</strong> was updated</p>
                  <span className="time">5 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon create"></div>
                <div className="activity-content">
                  <p>New task <strong>"User Testing"</strong> added to Backlog</p>
                  <span className="time">Yesterday</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon complete"></div>
                <div className="activity-content">
                  <p>Task <strong>"API Integration"</strong> moved to Done</p>
                  <span className="time">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
