import { create } from "zustand";
import { kanbanApi } from "../api";

interface SettingsState {
  settings: Record<string, string> & {
    boardViewMode: "kanban" | "table";
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  updateSettings: (newSettings: Record<string, string>) => Promise<void>;
  setBoardViewMode: (mode: "kanban" | "table") => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    // defaults
    focusTime: "25",
    shortBreakTime: "5",
    longBreakTime: "15",
    theme: "system",
    colorScheme: "Base16 Default",
    notificationsEnabled: "true",
    boardViewMode: "kanban",
  },
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const dbSettings = await kanbanApi.getSettings();
      set((state) => ({
        settings: { ...state.settings, ...dbSettings } as SettingsState["settings"],
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load settings",
        isLoading: false,
      });
    }
  },

  updateSetting: async (key: string, value: string) => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, [key]: value };

    // Optimistic UI update
    set({ settings: newSettings as SettingsState["settings"] });

    try {
      await kanbanApi.updateSettings({ [key]: value });
    } catch (error: unknown) {
      console.error("Failed to update setting:", error);
      // Revert on failure
      set({
        settings: currentSettings,
        error:
          error instanceof Error ? error.message : "Failed to update setting",
      });
    }
  },

  updateSettings: async (newSettings: Record<string, string>) => {
    const currentSettings = get().settings;
    const mergedSettings = { ...currentSettings, ...newSettings };

    // Optimistic UI update
    set({ settings: mergedSettings as SettingsState["settings"] });

    try {
      await kanbanApi.updateSettings(newSettings);
    } catch (error: unknown) {
      console.error("Failed to update settings:", error);
      // Revert on failure
      set({
        settings: currentSettings,
        error:
          error instanceof Error ? error.message : "Failed to update settings",
      });
    }
  },

  setBoardViewMode: async (mode: "kanban" | "table") => {
    await get().updateSetting("boardViewMode", mode);
  },
}));
