import {
  CheckCircle,
  Coffee,
  Edit2,
  Eye,
  Layers,
  MoreVertical,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { useKanbanStore } from "../stores/kanbanStore";
import { usePomodoroStore } from "../stores/pomodoroStore";
import { useProjectStore } from "../stores/projectStore";
import { useSettingsStore } from "../stores/settingsStore";
import { ProjectSelect } from "./ProjectSelect";
import { ViewTaskModal } from "./ViewTaskModal";

export function Pomodoro() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    selectedTaskId,
    setSelectedTaskId,
    timeLeft,
    totalTime,
    isActive,
    roundsCompleted,
    isBreak,
    isLongBreak,
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
  const longBreakTime = parseInt(settings.longBreakTime) || 15;
  const totalRounds = parseInt(settings.totalRounds) || 4;

  const { tasks, isLoading, loadAllTasks } = useKanbanStore();
  const { projects, loadProjects } = useProjectStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [viewTaskId, setViewTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadAllTasks();
    loadProjects();
  }, [loadAllTasks, loadProjects]);

  // Sync timer display when focus/break duration settings change — but NOT on
  // initial mount and NOT when the component simply remounts after navigation.
  // We track the previous values with refs: if they're null it means this is
  // the first render of this mount cycle, so we skip the sync.
  const prevFocusTimeRef = useRef<number | null>(null);
  const prevBreakTimeRef = useRef<number | null>(null);
  const prevLongBreakTimeRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      prevFocusTimeRef.current !== null &&
      (focusTime !== prevFocusTimeRef.current ||
        breakTime !== prevBreakTimeRef.current ||
        longBreakTime !== prevLongBreakTimeRef.current)
    ) {
      syncSettingsIfPaused();
    }
    prevFocusTimeRef.current = focusTime;
    prevBreakTimeRef.current = breakTime;
    prevLongBreakTimeRef.current = longBreakTime;
  }, [focusTime, breakTime, longBreakTime, syncSettingsIfPaused]);

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return tasks;
    return tasks.filter(
      (t: { projectId?: string }) => t.projectId === selectedProjectId,
    );
  }, [tasks, selectedProjectId]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId],
  );

  const handleMenuClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({ x: rect.right, y: rect.top + rect.height });
    setOpenMenuTaskId(taskId === openMenuTaskId ? null : taskId);
  };

  useEffect(() => {
    const handleClick = () => setOpenMenuTaskId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timeLeft / totalTime) * circumference;

  return (
    <div
      className="pomodoro-view"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {viewTaskId && (
        <ViewTaskModal
          task={tasks.find((t) => t.id === viewTaskId)}
          onClose={() => setViewTaskId(null)}
          onEdit={() => {
            const t = tasks.find((t) => t.id === viewTaskId);
            navigate(`/projects/${t?.projectId}/tasks/${viewTaskId}/edit`);
          }}
        />
      )}
      {openMenuTaskId && (
        <div
          className="task-menu-dropdown"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <div
            className="task-menu-item"
            onClick={() => {
              setViewTaskId(openMenuTaskId);
              setOpenMenuTaskId(null);
            }}
          >
            <Eye size={16} /> View Details
          </div>
          <div
            className="task-menu-item"
            onClick={() =>
              navigate(
                `/projects/${tasks.find((t) => t.id === openMenuTaskId)?.projectId}/tasks/${openMenuTaskId}/edit`,
              )
            }
          >
            <Edit2 size={16} /> Edit
          </div>
          <div
            className={`task-menu-item ${isActive ? "disabled" : ""}`}
            onClick={() => {
              if (!isActive) {
                setSelectedTaskId(openMenuTaskId);
                setOpenMenuTaskId(null);
              }
            }}
            style={{
              opacity: isActive ? 0.5 : 1,
              cursor: isActive ? "not-allowed" : "pointer",
              pointerEvents: isActive ? "none" : "auto",
            }}
            title={isActive ? "Cannot change task while session is active" : ""}
          >
            <CheckCircle size={16} /> Select & Continue
          </div>
        </div>
      )}
      {projects.length === 0 || tasks.length === 0 ? (
        <div
          className="empty-state"
          style={{ flexGrow: 1, border: "none", background: "none" }}
        >
          <div className="empty-state-illustration">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3>{t("pomodoro.no_projects_tasks")}</h3>
          <p>
            {t("pomodoro.create_project_hint")}
          </p>
        </div>
      ) : (
        <div className="pomodoro-layout">
          <div className="focus-panel">
            <div className="focus-header">
              <div className="rounds-container">
                <span className="rounds-label mono">
                  {t("pomodoro.round")} {Math.min(roundsCompleted + 1, totalRounds)} / {totalRounds}
                </span>
                <button
                  className="reset-rounds-btn"
                  onClick={resetRounds}
                  title={t("pomodoro.reset")}
                >
                  <RotateCcw size={12} strokeWidth={2} />
                </button>
              </div>
              <h2>{isBreak ? (isLongBreak ? t("pomodoro.long_break") : t("pomodoro.short_break")) : t("pomodoro.focus_session")}</h2>
              <p>
                {selectedTask
                  ? t("pomodoro.working_on", { task: selectedTask.title })
                  : t("pomodoro.select_task")}
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
                    {t("pomodoro.pause")} {isBreak ? (isLongBreak ? t("pomodoro.long_break") : t("pomodoro.short_break")) : t("pomodoro.focus")}
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    {t("pomodoro.start")} {isBreak ? (isLongBreak ? t("pomodoro.long_break") : t("pomodoro.short_break")) : t("pomodoro.focus")}
                  </>
                )}
              </button>
              <div className="secondary-controls">
                <button className="btn-secondary" onClick={resetCurrentSession}>
                  <RotateCcw size={16} strokeWidth={2} />
                  {t("pomodoro.reset")}
                </button>
                {isBreak ? (
                  <button
                    className="btn-secondary"
                    onClick={() => startFocus()}
                  >
                    <Layers size={16} strokeWidth={2} />
                    {t("pomodoro.focus")}
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={() => startBreak()}
                  >
                    <Coffee size={16} strokeWidth={2} />
                    {roundsCompleted >= totalRounds ? t("pomodoro.long_break") : t("pomodoro.break")}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="tasks-panel">
            <div className="tasks-panel-header">
              <h3>{t("pomodoro.kanban_tasks")}</h3>
              <div
                className="header-actions"
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <ProjectSelect
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                  projects={projects}
                />
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
                  {t("common.no_tasks")}
                </p>
              )}
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`pomodoro-task-card ${selectedTaskId === task.id ? "active" : ""} ${isActive ? "selection-disabled" : ""}`}
                  onClick={() => !isActive && setSelectedTaskId(task.id)}
                  style={{
                    cursor: isActive ? "not-allowed" : "pointer",
                    opacity: isActive && selectedTaskId !== task.id ? 0.6 : 1,
                  }}
                  title={
                    isActive ? "Cannot change task while session is active" : ""
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div className="task-labels">
                      {task.timeSpentMinutes > 0 && (
                        <span className="task-label priority-low">
                          {task.timeSpentMinutes}m {t("pomodoro.spent")}
                        </span>
                      )}
                      <div className="task-meta">
                        {selectedTaskId === task.id && (
                          <span className="status-badge in-progress">
                            {t("pomodoro.selected")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="icon-button"
                        onClick={(e) => handleMenuClick(e, task.id)}
                        style={{ padding: 0 }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  <h4 className="task-title">{task.title}</h4>
                  {task.description && (
                    <div className="task-description-preview text-accents-5 text-sm mt-1 markdown-preview">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {task.description}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
