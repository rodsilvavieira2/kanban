import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PomodoroSettings {
  focusTime: number; // minutes
  breakTime: number; // minutes
  totalRounds: number;
  notificationsEnabled: boolean;
  setFocusTime: (time: number) => void;
  setBreakTime: (time: number) => void;
  setTotalRounds: (rounds: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const usePomodoroStore = create<PomodoroSettings>()(
  persist(
    (set) => ({
      focusTime: 25,
      breakTime: 5,
      totalRounds: 4,
      notificationsEnabled: true,
      setFocusTime: (time) => set({ focusTime: time }),
      setBreakTime: (time) => set({ breakTime: time }),
      setTotalRounds: (rounds) => set({ totalRounds: rounds }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'pomodoro-settings',
    }
  )
);
