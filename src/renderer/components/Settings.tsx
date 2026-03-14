import React from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';

export function Settings() {
  const { 
    focusTime, 
    breakTime, 
    totalRounds, 
    notificationsEnabled,
    setFocusTime,
    setBreakTime,
    setTotalRounds,
    setNotificationsEnabled
  } = usePomodoroStore();

  return (
    <main className="settings-page">
      <div className="settings-scroll-area">
        <div className="settings-content-wrapper">
          
          {/* Header */}
          <div className="settings-page-header">
            <h2>Settings</h2>
            <p>Personalize your Kanban workspace and manage local data.</p>
          </div>

          {/* Section - General Settings */}
          <div className="settings-section">
            <div className="settings-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <h3>General Settings</h3>
            </div>
            <div className="settings-card">
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>App Theme</h4>
                  <p>Choose between light and dark mode.</p>
                </div>
                <div className="settings-card-actions">
                  <select className="form-input">
                    <option>Dark Mode</option>
                    <option>Light Mode</option>
                    <option>System Default</option>
                  </select>
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>Language Selection</h4>
                  <p>Choose your preferred language.</p>
                </div>
                <div className="settings-card-actions">
                  <select className="form-input">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Portuguese</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section - Pomodoro Configuration */}
          <div className="settings-section">
            <div className="settings-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <h3>Pomodoro Configuration</h3>
            </div>
            <div className="settings-card">
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>Focus Duration</h4>
                  <p>Set the length of your focus sessions (in minutes).</p>
                </div>
                <div className="settings-card-actions">
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ width: '80px' }} 
                    value={focusTime}
                    onChange={(e) => setFocusTime(parseInt(e.target.value) || 1)}
                    min="1"
                    max="60"
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>Break Duration</h4>
                  <p>Set the length of your break periods (in minutes).</p>
                </div>
                <div className="settings-card-actions">
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ width: '80px' }} 
                    value={breakTime}
                    onChange={(e) => setBreakTime(parseInt(e.target.value) || 1)}
                    min="1"
                    max="30"
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>Target Rounds</h4>
                  <p>Set the number of rounds for a full focus cycle.</p>
                </div>
                <div className="settings-card-actions">
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ width: '80px' }} 
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(parseInt(e.target.value) || 1)}
                    min="1"
                    max="12"
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>Desktop Notifications</h4>
                  <p>Receive an alert when a session ends.</p>
                </div>
                <div className="settings-card-actions">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section - Board Management */}
          <div className="settings-section">
            <div className="settings-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              <h3>Board Management</h3>
            </div>
            <div className="settings-card">
              <div className="settings-card-block">
                <div className="settings-card-info">
                  <h4>Default Board View</h4>
                  <p>Set the default view when opening a project.</p>
                </div>
                <div className="settings-card-actions" style={{ marginTop: '16px' }}>
                  <select className="form-input">
                    <option>Kanban Board</option>
                    <option>List View</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section - Data Management */}
          <div className="settings-section">
            <div className="settings-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              <h3>Data Management</h3>
            </div>

            <div className="settings-card">
              <div className="settings-card-block">
                <div className="settings-card-info">
                  <h4>Export Data</h4>
                  <p>Download a copy of your workspace data as JSON.</p>
                </div>
                <div className="settings-actions-row" style={{ marginTop: '16px' }}>
                  <button className="btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export Data
                  </button>
                  <button className="btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Import Data
                  </button>
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-card-block danger-block">
                <div className="danger-header">
                  <div className="danger-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <div className="danger-info">
                    <h4>Danger Zone</h4>
                    <p>Resetting all tasks will permanently delete everything from your local database. This action cannot be undone.</p>
                  </div>
                </div>
                <button className="btn-danger">
                  Reset Workspace
                </button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <h3>About</h3>
            </div>
            
            <div className="settings-card about-card">
              <div className="about-hero">
                <div className="about-logo-wrapper">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4H20V20H4V4Z" />
                    </svg>
                </div>
                <h4>Kanban Desktop Pro</h4>
                <p>Version 1.2.0 (Build 2024.10.24)</p>
              </div>

              <div className="settings-divider"></div>

              <div className="about-credits">
                <div className="credits-text">
                  <span>Developed By</span>
                  <strong>Studio Blueprints</strong>
                  <a href="#">studio-blueprints.io</a>
                </div>
                <div className="credits-logo">
                  <div className="logo-placeholder">SB</div>
                </div>
              </div>
            </div>
          </div>

          <footer className="settings-footer">
            <p>© 2024 Kanban Desktop Pro. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </footer>

        </div>
      </div>
    </main>
  );
}