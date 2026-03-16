import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePomodoroStore } from "../stores/pomodoroStore";
import { useKanbanStore } from "../stores/kanbanStore";
import { useSettingsStore } from "../stores/settingsStore";
import {
  RotateCcw,
  Pause,
  Play,
  Layers,
  Coffee,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";

export function Pomodoro() {
  const { selectedTaskId, setSelectedTaskId } = usePomodoroStore();

  const { settings } = useSettingsStore();
  const focusTime = parseInt(settings.focusTime) || 25;
  const breakTime = parseInt(settings.shortBreakTime) || 5;
  const totalRounds = parseInt(settings.totalRounds) || 4;
  const notificationsEnabled = settings.notificationsEnabled === "true";

  const { tasks, isLoading, loadAllTasks, updateTaskTime } = useKanbanStore();

  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [totalTime, setTotalTime] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    loadAllTasks();
  }, [loadAllTasks]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId],
  );

  // Update timer if settings change while not active
  useEffect(() => {
    if (!isActive) {
      const newTime = (isBreak ? breakTime : focusTime) * 60;
      setTimeLeft(newTime);
      setTotalTime(newTime);
    }
  }, [focusTime, breakTime, isBreak, isActive]);

  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (notificationsEnabled && Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (notificationsEnabled && Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    },
    [notificationsEnabled],
  );

  const startBreak = useCallback(
    (autoStart = false) => {
      const time = breakTime * 60;
      setIsActive(autoStart);
      setIsBreak(true);
      setTimeLeft(time);
      setTotalTime(time);
      sendNotification("Focus Session Complete", "Time for a break!");
    },
    [breakTime, sendNotification],
  );

  const startFocus = useCallback(
    (autoStart = false) => {
      const time = focusTime * 60;
      setIsActive(autoStart);
      setIsBreak(false);
      setTimeLeft(time);
      setTotalTime(time);
      setRoundsCompleted((prev) => prev + 1);
      sendNotification("Break Over", "Back to work!");
    },
    [focusTime, sendNotification],
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);

      if (!isBreak) {
        // Focus session finished - Update task time
        if (selectedTaskId) {
          updateTaskTime(selectedTaskId, focusTime);
        }
        startBreak(false);
      } else {
        startFocus(false);
      }
    }

    return () => clearInterval(interval);
  }, [
    isActive,
    timeLeft,
    isBreak,
    startBreak,
    startFocus,
    selectedTaskId,
    focusTime,
    updateTaskTime,
  ]);

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

  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timeLeft / totalTime) * circumference;

  return (
    <div className="pomodoro-view">
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

          <div className="tasks-list">
            {tasks.length === 0 && !isLoading && (
              <p className="text-center text-accents-5 py-8">
                No tasks found. Create some in a project first!
              </p>
            )}
            {tasks.map((task) => (
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
    </div>
  );
}
