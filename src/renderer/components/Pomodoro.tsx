import React, { useState, useEffect, useMemo } from "react";
import { usePomodoroStore } from "../stores/pomodoroStore";
import { useKanbanStore } from "../stores/kanbanStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useProjectStore } from "../stores/projectStore";
import {
  RotateCcw,
  Pause,
  Play,
  Layers,
  Coffee,
  RefreshCw,
  Clock,
} from "lucide-react";

export function Pomodoro() {
  const {
    selectedTaskId,
    setSelectedTaskId,
    timeLeft,
    totalTime,
    isActive,
    roundsCompleted,
    isBreak,
    toggleTimer,
    resetCurrentSession,
    resetRounds,
    startFocus,
    startBreak,
    syncSettingsIfPaused,
  } = usePomodoroStore();

  const { settings } = useSettingsStore();
  const focusTime = parseInt(settings.focusTime) || 25;
  const breakTime = parseInt(settings.shortBreakTime) || 5;
  const totalRounds = parseInt(settings.totalRounds) || 4;

  const { tasks, isLoading, loadAllTasks } = useKanbanStore();
  const { projects, loadProjects } = useProjectStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  useEffect(() => {
    loadAllTasks();
    loadProjects();
  }, [loadAllTasks, loadProjects]);

  // Sync timer display when settings change while the timer is paused
  useEffect(() => {
    syncSettingsIfPaused();
  }, [focusTime, breakTime, syncSettingsIfPaused]);

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return tasks;
    return tasks.filter((t: { projectId?: string }) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId],
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timeLeft / totalTime) * circumference;

  return (
    <div className="pomodoro-view" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {(projects.length === 0 || tasks.length === 0) ? (
        <div className="empty-state" style={{ flexGrow: 1, border: 'none', background: 'none' }}>
          <div className="empty-state-illustration">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3>No projects or tasks to focus on</h3>
          <p>Create a project and add tasks to start your first focus session.</p>
        </div>
      ) : (
        <div className="pomodoro-layout">
          <div className="focus-panel">
            <div className="focus-header">
              <div className="rounds-container">
                <span className="rounds-label mono">
                  ROUND {roundsCompleted + 1} / {totalRounds}
                </span>
                <button
                  className="reset-rounds-btn"
                  onClick={resetRounds}
                  title="Reset Rounds"
                >
                  <RotateCcw size={12} strokeWidth={2} />
                </button>
              </div>
              <h2>{isBreak ? "Break" : "Focus Session"}</h2>
              <p>
                {selectedTask
                  ? `Working on: ${selectedTask.title}`
                  : "Select a task to start focused work"}
              </p>
            </div>

            <div className="timer-container">
              <svg
                width="400"
                height="400"
                viewBox="0 0 400 400"
                className="timer-svg"
              >
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
                <div className="time-numbers tabular-nums">
                  <span className="time-part">
                    {minutes.toString().padStart(2, "0")}
                  </span>
                  <span className="time-colon">:</span>
                  <span className="time-part">
                    {seconds.toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="time-labels">
                  <span>MINUTES</span>
                  <span>SECONDS</span>
                </div>
              </div>
            </div>

            <div className="timer-controls">
              <button
                className="btn-primary start-btn"
                onClick={toggleTimer}
                disabled={!selectedTaskId && !isBreak}
              >
                {isActive ? (
                  <>
                    <Pause size={18} strokeWidth={2} />
                    Pause {isBreak ? "Break" : "Focus"}
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    Start {isBreak ? "Break" : "Focus"}
                  </>
                )}
              </button>
              <div className="secondary-controls">
                <button className="btn-secondary" onClick={resetCurrentSession}>
                  <RotateCcw size={16} strokeWidth={2} />
                  Reset
                </button>
                {isBreak ? (
                  <button className="btn-secondary" onClick={() => startFocus()}>
                    <Layers size={16} strokeWidth={2} />
                    Focus
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={() => startBreak()}>
                    <Coffee size={16} strokeWidth={2} />
                    Break
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="tasks-panel">
            <div className="tasks-panel-header">
              <h3>Kanban Tasks</h3>
              <div className="header-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  className="project-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--accents-2)",
                    color: "var(--accents-8)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "12px",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  className="icon-button"
                  onClick={() => loadAllTasks()}
                  disabled={isLoading}
                >
                  <RefreshCw
                    size={18}
                    strokeWidth={2}
                    className={isLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            <div className="tasks-list">
              {filteredTasks.length === 0 && !isLoading && (
                <p className="text-center text-accents-5 py-8">
                  No tasks found. Create some in a project first!
                </p>
              )}
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`pomodoro-task-card ${selectedTaskId === task.id ? "active" : ""}`}
                  onClick={() => !isActive && setSelectedTaskId(task.id)}
                  style={{ cursor: isActive ? "not-allowed" : "pointer" }}
                >
                  <div className="task-labels">
                    <span className="task-label">TASK</span>
                    {task.timeSpentMinutes > 0 && (
                      <span className="task-label priority-low">
                        {task.timeSpentMinutes}m spent
                      </span>
                    )}
                  </div>
                  <h4 className="task-title">{task.title}</h4>
                  {task.description && (
                    <p className="task-desc line-clamp-2">{task.description}</p>
                  )}
                  <div className="task-meta">
                    <div className="task-meta-left">
                      <span className="meta-item">
                        <Clock size={12} strokeWidth={2} />{" "}
                        {task.timeSpentMinutes}m
                      </span>
                    </div>
                    {selectedTaskId === task.id && (
                      <span className="status-badge in-progress">SELECTED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
