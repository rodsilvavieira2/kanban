import React from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { Sliders, Clock, Layout, Database, Download, Upload, AlertTriangle, Info, Box } from 'lucide-react';

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
              <Sliders size={20} color="var(--accent-color)" strokeWidth={2} />
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
              <Clock size={20} color="var(--accent-color)" strokeWidth={2} />
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
              <Layout size={20} color="var(--accent-color)" strokeWidth={2} />
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
              <Database size={20} color="var(--accent-color)" strokeWidth={2} />
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
                    <Download size={16} strokeWidth={2} />
                    Export Data
                  </button>
                  <button className="btn-secondary">
                    <Upload size={16} strokeWidth={2} />
                    Import Data
                  </button>
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-card-block danger-block">
                <div className="danger-header">
                  <div className="danger-icon">
                    <AlertTriangle size={20} strokeWidth={2} />
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
              <Info size={20} color="var(--accent-color)" strokeWidth={2} />
              <h3>About</h3>
            </div>
            
            <div className="settings-card about-card">
              <div className="about-hero">
                <div className="about-logo-wrapper">
                   <Box size={32} strokeWidth={2} />
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