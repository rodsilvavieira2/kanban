import React, { useState, useEffect, useCallback } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';

export function Pomodoro() {
  const { 
    focusTime, 
    breakTime, 
    totalRounds, 
    notificationsEnabled 
  } = usePomodoroStore();

  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [totalTime, setTotalTime] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  // Update timer if settings change while not active
  useEffect(() => {
    if (!isActive) {
      const newTime = (isBreak ? breakTime : focusTime) * 60;
      setTimeLeft(newTime);
      setTotalTime(newTime);
    }
  }, [focusTime, breakTime, isBreak, isActive]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (notificationsEnabled && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (notificationsEnabled && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }, [notificationsEnabled]);

  const startBreak = useCallback((autoStart = false) => {
    const time = breakTime * 60;
    setIsActive(autoStart);
    setIsBreak(true);
    setTimeLeft(time);
    setTotalTime(time);
    sendNotification('Focus Session Complete', 'Time for a break!');
  }, [breakTime, sendNotification]);

  const startFocus = useCallback((autoStart = false) => {
    const time = focusTime * 60;
    setIsActive(autoStart);
    setIsBreak(false);
    setTimeLeft(time);
    setTotalTime(time);
    setRoundsCompleted((prev) => prev + 1);
    sendNotification('Break Over', 'Back to work!');
  }, [focusTime, sendNotification]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!isBreak) {
        startBreak(false);
      } else {
        startFocus(false);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, startBreak, startFocus]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetCurrentSession = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const resetRounds = () => {
    setRoundsCompleted(0);
    setIsActive(false);
    setIsBreak(false);
    const time = focusTime * 60;
    setTimeLeft(time);
    setTotalTime(time);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Calculate SVG circle progress
  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  return (
    <div className="pomodoro-view">
      <div className="pomodoro-layout">
        <div className="focus-panel">
          <div className="focus-header">
            <div className="rounds-container">
              <span className="rounds-label">ROUND {roundsCompleted + 1} / {totalRounds}</span>
              <button className="reset-rounds-btn" onClick={resetRounds} title="Reset Rounds">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
              </button>
            </div>
            <h2>{isBreak ? 'Break' : 'Focus Session'}</h2>
            <p>Deep work on "Design System Update"</p>
          </div>

          <div className="timer-container">
            <svg width="400" height="400" viewBox="0 0 400 400" className="timer-svg">
              <circle
                cx="200"
                cy="200"
                r={radius}
                className="timer-circle-bg"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="200"
                cy="200"
                r={radius}
                className="timer-circle-progress"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 200 200)"
              />
            </svg>
            
            <div className="timer-display">
              <div className="time-numbers">
                <span className="time-part">{minutes.toString().padStart(2, '0')}</span>
                <span className="time-colon">:</span>
                <span className="time-part">{seconds.toString().padStart(2, '0')}</span>
              </div>
              <div className="time-labels">
                <span>MINUTES</span>
                <span>SECONDS</span>
              </div>
            </div>
          </div>

          <div className="timer-controls">
            <button className="btn-primary start-btn" onClick={toggleTimer}>
              {isActive ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  Pause {isBreak ? 'Break' : 'Focus'}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Start {isBreak ? 'Break' : 'Focus'}
                </>
              )}
            </button>
            <div className="secondary-controls">
              <button className="btn-secondary" onClick={resetCurrentSession}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                Reset
              </button>
              {isBreak ? (
                <button className="btn-secondary" onClick={() => startFocus()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                  Focus
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => startBreak()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                  Break
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="tasks-panel">
          <div className="tasks-panel-header">
            <h3>Kanban Tasks</h3>
            <button className="icon-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </button>
          </div>

          <div className="tasks-list">
            <div className="pomodoro-task-card active">
              <div className="task-labels">
                <span className="task-label">TO DO</span>
                <span className="task-label priority-high">HIGH PRIORITY</span>
              </div>
              <h4 className="task-title">Design System Update</h4>
              <p className="task-desc">Update the primary color palette and component library to match new brand guidelines.</p>
              <div className="task-meta">
                <div className="task-meta-left">
                  <span className="meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 25m</span>
                  <span className="meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> 12</span>
                </div>
                <span className="status-badge in-progress">ACTIVE</span>
              </div>
            </div>

            <div className="pomodoro-task-card">
              <div className="task-labels">
                <span className="task-label">IN PROGRESS</span>
                <span className="task-label priority-high">HIGH PRIORITY</span>
              </div>
              <h4 className="task-title">API Integration</h4>
              <p className="task-desc">Connect the backend dashboard to the production Stripe API endpoints.</p>
              <div className="task-meta">
                <div className="task-meta-left">
                  <span className="meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 50m</span>
                </div>
              </div>
            </div>

            <div className="pomodoro-task-card">
              <div className="task-labels">
                <span className="task-label">IN PROGRESS</span>
                <span className="task-label priority-low">LOW PRIORITY</span>
              </div>
              <h4 className="task-title">Footer Redesign</h4>
              <p className="task-desc">Minor adjustments to the landing page footer links and spacing.</p>
              <div className="task-meta">
                <div className="task-meta-left">
                  <span className="meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 25m</span>
                </div>
              </div>
            </div>

            <div className="pomodoro-task-card">
              <div className="task-labels">
                <span className="task-label">TO DO</span>
                <span className="task-label priority-medium">MEDIUM PRIORITY</span>
              </div>
              <h4 className="task-title">User Research Interview</h4>
              <p className="task-desc">Schedule and conduct feedback sessions with top 5 enterprise clients.</p>
              <div className="task-meta">
                <div className="task-meta-left">
                  <span className="meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> 3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="project-progress-footer">
            <div className="progress-header">
              <span>PROJECT ALPHA PROGRESS</span>
              <span>45%</span>
            </div>
            <div className="progress-bar">
              <div className="progress fill" style={{ width: '45%', backgroundColor: 'var(--accent-color)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}