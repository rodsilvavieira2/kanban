import React from "react";
import { Box, Grid, Layers, Clock, Settings } from "lucide-react";

interface SidebarProps {
  currentView: "dashboard" | "projects" | "pomodoro" | "settings";
  onViewChange: (
    view: "dashboard" | "projects" | "pomodoro" | "settings",
  ) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Box size={18} strokeWidth={2} />
        </div>
        <span className="brand-title">TaskMaster</span>
      </div>

      <nav className="nav-menu">
        <a
          className={`nav-item ${currentView === "dashboard" ? "active" : ""}`}
          onClick={() => onViewChange("dashboard")}
        >
          <Grid size={18} strokeWidth={1.5} />
          Dashboard
        </a>
        <a
          className={`nav-item ${currentView === "projects" ? "active" : ""}`}
          onClick={() => onViewChange("projects")}
        >
          <Layers size={18} strokeWidth={1.5} />
          Projects
        </a>
        <a
          className={`nav-item ${currentView === "pomodoro" ? "active" : ""}`}
          onClick={() => onViewChange("pomodoro")}
        >
          <Clock size={18} strokeWidth={1.5} />
          Pomodoro
        </a>
      </nav>

      <div style={{ marginTop: "auto", padding: "24px" }}>
        <button
          className={`btn-secondary ${currentView === "settings" ? "active" : ""}`}
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => onViewChange("settings")}
        >
          <Settings size={18} strokeWidth={1.5} />
          Settings
        </button>
      </div>
    </aside>
  );
}
