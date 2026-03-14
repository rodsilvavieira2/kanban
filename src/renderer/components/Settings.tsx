import React from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Sliders, Clock, Layout, Database, Download, Upload, AlertTriangle, Info, Box } from 'lucide-react';

export function Settings() {
  const { 
    setFocusTime,
    setBreakTime,
    setTotalRounds,
    setNotificationsEnabled
  } = usePomodoroStore();

  const { settings, updateSetting } = useSettingsStore();

  const [exportStatus, setExportStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleExportData = async () => {
    if (exportStatus === 'loading') return;
    setExportStatus('loading');
    try {
      const payload = await (window as any).kanbanApi.exportData();
      const content = JSON.stringify(payload, null, 2);
      const timestamp = new Date().toISOString().slice(0, 10);
      const result = await (window as any).kanbanApi.showSaveDialog(`kanban-export-${timestamp}.json`, content);
      if (result?.success) {
        setExportStatus('success');
      } else {
        setExportStatus('idle'); // Cancelled — no error
      }
    } catch (err) {
      console.error('Export failed:', err);
      setExportStatus('error');
    } finally {
      // Reset success/error state after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleFocusTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setFocusTime(val);
    updateSetting('focusTime', val.toString());
  };

  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setBreakTime(val);
    updateSetting('shortBreakTime', val.toString());
  };

  const handleTotalRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setTotalRounds(val);
    updateSetting('totalRounds', val.toString());
  };

  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setNotificationsEnabled(checked);
    updateSetting('notificationsEnabled', checked.toString());
  };

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
                  <select 
                    className="form-input"
                    value={settings.theme || 'system'}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                  >
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                    <option value="system">System Default</option>
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
                    value={settings.focusTime || '25'}
                    onChange={handleFocusTimeChange}
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
                    value={settings.shortBreakTime || '5'}
                    onChange={handleBreakTimeChange}
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
                    value={settings.totalRounds || '4'}
                    onChange={handleTotalRoundsChange}
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
                      checked={settings.notificationsEnabled === 'true'}
                      onChange={handleNotificationsChange}
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
                  <button 
                    className={`btn-secondary ${exportStatus === 'success' ? 'btn-success' : exportStatus === 'error' ? 'btn-error' : ''}`}
                    onClick={handleExportData}
                    disabled={exportStatus === 'loading'}
                  >
                    <Download size={16} strokeWidth={2} />
                    {exportStatus === 'loading' ? 'Exporting…' : exportStatus === 'success' ? 'Exported!' : exportStatus === 'error' ? 'Export Failed' : 'Export Data'}
                  </button>
                  <button className="btn-secondary" disabled>
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