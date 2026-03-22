import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { useSettingsStore } from "../stores/settingsStore";
import { themes } from "../../shared/themes";

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const themeMode = useSettingsStore((state) => state.settings.theme);
  const colorScheme =
    useSettingsStore((state) => state.settings.colorScheme) || "Base16 Default";
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  React.useEffect(() => {
    let isDark = false;
    if (themeMode === "dark") {
      isDark = true;
      document.documentElement.dataset.theme = "dark";
    } else if (themeMode === "light") {
      isDark = false;
      document.documentElement.dataset.theme = "light";
    } else {
      // System default
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
    }

    const activeTheme = themes.find((t) => t.name === colorScheme) || themes[0];
    const colors = isDark ? activeTheme.dark : activeTheme.light;
    const root = document.documentElement;

    root.style.setProperty("--bg-main", colors.background);
    root.style.setProperty(
      "--bg-secondary",
      `color-mix(in srgb, ${colors.background} 94%, ${colors.foreground})`,
    );
    root.style.setProperty(
      "--bg-sidebar",
      `color-mix(in srgb, ${colors.background} 97%, ${colors.foreground})`,
    );

    root.style.setProperty(
      "--border-color",
      `color-mix(in srgb, ${colors.background} 85%, ${colors.foreground})`,
    );
    root.style.setProperty(
      "--border-hover",
      `color-mix(in srgb, ${colors.background} 75%, ${colors.foreground})`,
    );

    root.style.setProperty("--text-primary", colors.foreground);
    root.style.setProperty(
      "--text-secondary",
      `color-mix(in srgb, ${colors.foreground} 70%, ${colors.background})`,
    );
    root.style.setProperty(
      "--text-tertiary",
      `color-mix(in srgb, ${colors.foreground} 40%, ${colors.background})`,
    );

    root.style.setProperty("--accent-color", colors.blue);
    root.style.setProperty(
      "--accent-transparent",
      `color-mix(in srgb, ${colors.blue} 15%, transparent)`,
    );

    root.style.setProperty("--success", colors.green);
    root.style.setProperty("--warning", colors.yellow);
    root.style.setProperty("--error", colors.red);

    root.style.setProperty("--button-bg", colors.foreground);
    root.style.setProperty("--button-text", colors.background);
  }, [themeMode, colorScheme]);

  // Determine current view for Sidebar highlighting
  let currentView: "dashboard" | "projects" | "pomodoro" | "settings" =
    "dashboard";
  if (location.pathname === "/settings") currentView = "settings";
  else if (location.pathname === "/pomodoro") currentView = "pomodoro";
  else if (location.pathname.startsWith("/projects")) currentView = "projects";

  return (
    <>
      <Sidebar
        currentView={currentView}
        onViewChange={(view) =>
          navigate(`/${view === "dashboard" ? "" : view}`)
        }
      />
      <Outlet context={{ openModal: () => setIsModalOpen(true) }} />
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
