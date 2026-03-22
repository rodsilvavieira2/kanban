import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "./settingsStore";
import { useKanbanStore } from "./kanbanStore";

// ---------------------------------------------------------------------------
// Module-level timer plumbing — lives outside React so the interval survives
// navigation and the timer keeps running regardless of which view is active.
// ---------------------------------------------------------------------------

let _intervalId: ReturnType<typeof setInterval> | null = null;

// Captured during store creation so module-level functions can read/write state.
let _get: (() => PomodoroState) | null = null;
let _set: ((partial: Partial<PomodoroState> | ((s: PomodoroState) => Partial<PomodoroState>)) => void) | null = null;

function _stopInterval() {
  if (_intervalId !== null) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
}

function _getTimerSettings() {
  const s = useSettingsStore.getState().settings;
  return {
    focusTime: parseInt(s.focusTime) || 25,
    breakTime: parseInt(s.shortBreakTime) || 5,
    notificationsEnabled: s.notificationsEnabled === "true",
  };
}

function _sendNotification(title: string, body: string) {
  const { notificationsEnabled } = _getTimerSettings();
  if (!notificationsEnabled) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body });
    });
  }
}

function _startInterval() {
  if (!_get || !_set) return;
  _stopInterval();
  _intervalId = setInterval(() => {
    const state = _get!();
    const newTimeLeft = state.timeLeft - 1;

    if (newTimeLeft > 0) {
      // Update timeLeft and record the wall-clock timestamp so the store can
      // correct for elapsed time if the app is closed and reopened.
      _set!({ timeLeft: newTimeLeft, _savedAt: Date.now() });

      // Track time on task every completed minute (routes through kanbanStore
      // so the in-memory task list stays in sync — Bug 2 fix).
      if (!state.isBreak && state.selectedTaskId) {
        const elapsed = state.totalTime - newTimeLeft;
        if (elapsed > 0 && elapsed % 60 === 0) {
          useKanbanStore.getState().updateTaskTime(state.selectedTaskId, 1).catch(
            (err: unknown) => {
              console.error("Failed to update task time:", err);
            },
          );
        }
      }
    } else {
      // Transition in the SAME tick as timeLeft hitting 0 — eliminates the
      // 1-second notification lag (Bug 3 fix).
      _set!({ timeLeft: 0, isActive: false, _savedAt: Date.now() });
      _stopInterval();
      if (!state.isBreak) {
        _get!().startBreak(false);
      } else {
        _get!().startFocus(false);
      }
    }
  }, 1000);
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface PomodoroState {
  // Settings (persisted)
  focusTime: number;
  breakTime: number;
  totalRounds: number;
  notificationsEnabled: boolean;
  selectedTaskId: string | null;

  // Live timer state (also persisted so state survives navigation + app restarts)
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  roundsCompleted: number;
  isBreak: boolean;
  /** Timestamp (ms) of the last interval tick — used to correct timeLeft on rehydration. */
  _savedAt: number;

  // Settings actions (called by Settings.tsx)
  setFocusTime: (time: number) => void;
  setBreakTime: (time: number) => void;
  setTotalRounds: (rounds: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;

  // Timer actions
  toggleTimer: () => void;
  resetCurrentSession: () => void;
  resetRounds: () => void;
  startFocus: (autoStart?: boolean) => void;
  startBreak: (autoStart?: boolean) => void;
  syncSettingsIfPaused: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => {
      // Capture get/set so module-level functions (_startInterval etc.) can
      // access and mutate state without going through React hooks.
      _get = get;
      _set = set as typeof _set;

      return {
        // Settings defaults
        focusTime: 25,
        breakTime: 5,
        totalRounds: 4,
        notificationsEnabled: true,
        selectedTaskId: null,

        // Timer defaults
        timeLeft: 25 * 60,
        totalTime: 25 * 60,
        isActive: false,
        roundsCompleted: 0,
        isBreak: false,
        _savedAt: 0,

        // Settings actions
        setFocusTime: (time) => set({ focusTime: time }),
        setBreakTime: (time) => set({ breakTime: time }),
        setTotalRounds: (rounds) => set({ totalRounds: rounds }),
        setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
        setSelectedTaskId: (id) => set({ selectedTaskId: id }),

        // Timer actions
        toggleTimer: () => {
          const { isActive, timeLeft, isBreak, selectedTaskId } = get();
          if (isActive) {
            _stopInterval();
            set({ isActive: false, _savedAt: Date.now() });
          } else {
            if (timeLeft === 0) return;

            // When starting a focus session, move the selected task to the
            // second column (In Progress) if it is still in the first column
            // (Bug 1 fix).
            if (!isBreak && selectedTaskId) {
              const { tasks, columns } = useKanbanStore.getState();
              const task = tasks.find((t) => t.id === selectedTaskId);
              if (task) {
                const projectColumns = columns
                  .filter((c) => c.projectId === task.projectId)
                  .sort((a, b) => a.order - b.order);
                const isInFirstColumn =
                  projectColumns.length > 0 &&
                  task.columnId === projectColumns[0].id;
                if (isInFirstColumn && projectColumns.length >= 2) {
                  const sourceCol = projectColumns[0];
                  const destCol = projectColumns[1];
                  const sourceTasks = tasks
                    .filter((t) => t.columnId === sourceCol.id)
                    .sort((a, b) => a.order - b.order);
                  const sourceIndex = sourceTasks.findIndex(
                    (t) => t.id === selectedTaskId,
                  );
                  const destTasks = tasks.filter(
                    (t) => t.columnId === destCol.id,
                  );
                  useKanbanStore.getState().moveTask({
                    taskId: selectedTaskId,
                    sourceColumnId: sourceCol.id,
                    destinationColumnId: destCol.id,
                    sourceIndex: sourceIndex >= 0 ? sourceIndex : 0,
                    destinationIndex: destTasks.length,
                  });
                }
              }
            }

            set({ isActive: true, _savedAt: Date.now() });
            _startInterval();
          }
        },

        startBreak: (autoStart = false) => {
          const { breakTime } = _getTimerSettings();
          const time = breakTime * 60;
          _stopInterval();
          set({ isActive: autoStart, isBreak: true, timeLeft: time, totalTime: time, _savedAt: Date.now() });
          _sendNotification("Focus Session Complete", "Time for a break!");
          if (autoStart) _startInterval();
        },

        startFocus: (autoStart = false) => {
          const { focusTime } = _getTimerSettings();
          const time = focusTime * 60;
          _stopInterval();
          set((state) => ({
            isActive: autoStart,
            isBreak: false,
            timeLeft: time,
            totalTime: time,
            roundsCompleted: state.roundsCompleted + 1,
            _savedAt: Date.now(),
          }));
          _sendNotification("Break Over", "Back to work!");
          if (autoStart) _startInterval();
        },

        resetCurrentSession: () => {
          _stopInterval();
          set((state) => ({ isActive: false, timeLeft: state.totalTime, _savedAt: Date.now() }));
        },

        resetRounds: () => {
          _stopInterval();
          const { focusTime } = _getTimerSettings();
          const time = focusTime * 60;
          set({
            roundsCompleted: 0,
            isActive: false,
            isBreak: false,
            timeLeft: time,
            totalTime: time,
            _savedAt: Date.now(),
          });
        },

        // Only resets timeLeft when the timer is at its full value (i.e. no
        // session has been started yet, or it was just reset). This prevents
        // a settings reload from wiping out a paused mid-session timer.
        syncSettingsIfPaused: () => {
          const { isActive, isBreak, timeLeft, totalTime } = get();
          if (!isActive && timeLeft === totalTime) {
            const { focusTime, breakTime } = _getTimerSettings();
            const newTime = (isBreak ? breakTime : focusTime) * 60;
            set({ timeLeft: newTime, totalTime: newTime, _savedAt: Date.now() });
          }
        },
      };
    },
    {
      name: "pomodoro-settings",
      // Persist everything — both settings AND live timer state — so the timer
      // survives navigation (in-memory) and app restarts (localStorage).
      partialize: (state) => ({
        focusTime: state.focusTime,
        breakTime: state.breakTime,
        totalRounds: state.totalRounds,
        notificationsEnabled: state.notificationsEnabled,
        selectedTaskId: state.selectedTaskId,
        timeLeft: state.timeLeft,
        totalTime: state.totalTime,
        isActive: state.isActive,
        roundsCompleted: state.roundsCompleted,
        isBreak: state.isBreak,
        _savedAt: state._savedAt,
      }),
      onRehydrateStorage: () => (state) => {
        // This runs once after the module loads and localStorage is read.
        // If the timer was active when the app last closed, correct timeLeft
        // for the real elapsed wall-clock time and restart the interval.
        if (!state?.isActive || !state._savedAt) return;
        const elapsed = Math.floor((Date.now() - state._savedAt) / 1000);
        const correctedTimeLeft = Math.max(0, state.timeLeft - elapsed);
        setTimeout(() => {
          if (!_get || !_set) return;
          if (correctedTimeLeft > 0) {
            _set({ timeLeft: correctedTimeLeft });
            _startInterval();
          } else {
            // Session finished while the app was closed — transition now.
            _set({ isActive: false, timeLeft: 0 });
            if (!_get().isBreak) {
              _get().startBreak(false);
            } else {
              _get().startFocus(false);
            }
          }
        }, 0);
      },
    },
  ),
);
