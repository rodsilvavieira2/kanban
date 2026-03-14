import { create } from 'zustand';

interface SettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  updateSettings: (newSettings: Record<string, string>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    // defaults
    focusTime: '25',
    shortBreakTime: '5',
    longBreakTime: '15',
    theme: 'system',
    notificationsEnabled: 'true',
  },
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const dbSettings = await window.kanbanApi.getSettings();
      set((state) => ({
        settings: { ...state.settings, ...dbSettings },
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to load settings', isLoading: false });
    }
  },

  updateSetting: async (key: string, value: string) => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, [key]: value };
    
    // Optimistic UI update
    set({ settings: newSettings });

    try {
      await window.kanbanApi.updateSettings({ [key]: value });
    } catch (error: any) {
      console.error('Failed to update setting:', error);
      // Revert on failure
      set({ settings: currentSettings, error: error.message || 'Failed to update setting' });
    }
  },

  updateSettings: async (newSettings: Record<string, string>) => {
    const currentSettings = get().settings;
    const mergedSettings = { ...currentSettings, ...newSettings };
    
    // Optimistic UI update
    set({ settings: mergedSettings });

    try {
      await window.kanbanApi.updateSettings(newSettings);
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      // Revert on failure
      set({ settings: currentSettings, error: error.message || 'Failed to update settings' });
    }
  }
}));
