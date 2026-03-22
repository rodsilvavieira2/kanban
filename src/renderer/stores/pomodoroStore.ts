import { create } from "zustand";
import { persist } from "zustand/middleware";
import { kanbanApi } from "../api";
import { useSettingsStore } from "./settingsStore";

// Module-level interval reference — lives outside React's component lifecycle.
// This is the key to keeping the timer running across navigation.
let _intervalId: ReturnType<typeof setInterval> | null = null;

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

interface PomodoroState {
  // Settings (persisted — kept for Settings.tsx backward compat)
  focusTime: number;
  breakTime: number;
  totalRounds: number;
  notificationsEnabled: boolean;
  selectedTaskId: string | null;

  // Live timer state (in-memory only — survives navigation, resets on app restart)
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  roundsCompleted: number;
  isBreak: boolean;

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

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => {
      function startInterval() {
        _stopInterval();
        _intervalId = setInterval(() => {
          const state = get();

          if (state.timeLeft > 0) {
            const newTimeLeft = state.timeLeft - 1;
            set({ timeLeft: newTimeLeft });

            // Track time on task every completed minute
            if (!state.isBreak && state.selectedTaskId) {
              const elapsed = state.totalTime - newTimeLeft;
              if (elapsed > 0 && elapsed % 60 === 0) {
                kanbanApi.updateTaskTime(state.selectedTaskId, 1).catch(
                  (err: unknown) => {
                    console.error("Failed to update task time:", err);
                  },
                );
              }
            }
          } else {
            // Session finished — transition to next phase
            _stopInterval();
            set({ isActive: false });
            if (!state.isBreak) {
              get().startBreak(false);
            } else {
              get().startFocus(false);
            }
          }
        }, 1000);
      }

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

        // Settings actions
        setFocusTime: (time) => set({ focusTime: time }),
        setBreakTime: (time) => set({ breakTime: time }),
        setTotalRounds: (rounds) => set({ totalRounds: rounds }),
        setNotificationsEnabled: (enabled) =>
          set({ notificationsEnabled: enabled }),
        setSelectedTaskId: (id) => set({ selectedTaskId: id }),

        // Timer actions
        toggleTimer: () => {
          const { isActive, timeLeft } = get();
          if (isActive) {
            _stopInterval();
            set({ isActive: false });
          } else {
            if (timeLeft === 0) return;
            set({ isActive: true });
            startInterval();
          }
        },

        startBreak: (autoStart = false) => {
          const { breakTime } = _getTimerSettings();
          const time = breakTime * 60;
          _stopInterval();
          set({ isActive: autoStart, isBreak: true, timeLeft: time, totalTime: time });
          _sendNotification("Focus Session Complete", "Time for a break!");
          if (autoStart) startInterval();
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
          }));
          _sendNotification("Break Over", "Back to work!");
          if (autoStart) startInterval();
        },

        resetCurrentSession: () => {
          _stopInterval();
          set((state) => ({ isActive: false, timeLeft: state.totalTime }));
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
          });
        },

        // Called by Pomodoro.tsx when settings change to sync display while paused
        syncSettingsIfPaused: () => {
          const { isActive, isBreak } = get();
          if (!isActive) {
            const { focusTime, breakTime } = _getTimerSettings();
            const newTime = (isBreak ? breakTime : focusTime) * 60;
            set({ timeLeft: newTime, totalTime: newTime });
          }
        },
      };
    },
    {
      name: "pomodoro-settings",
      // Only persist settings — live timer state is memory-only
      partialize: (state) => ({
        focusTime: state.focusTime,
        breakTime: state.breakTime,
        totalRounds: state.totalRounds,
        notificationsEnabled: state.notificationsEnabled,
        selectedTaskId: state.selectedTaskId,
      }),
    },
  ),
);
