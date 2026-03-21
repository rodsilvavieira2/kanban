import React, { useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useOutletContext } from "react-router-dom";

import { useKanbanStore } from "../../stores/kanbanStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useProjectStore } from "../../stores/projectStore";
import { themes, ThemeColors } from "../../../shared/themes";
import { getThemeColor } from "../../utils/themeUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ColumnStat {
  label: string;
  value: number;
  color: string;
}

function buildColumnStats(
  tasks: { columnId: string }[],
  columns: { id: string; title: string; color?: string }[],
  colors: ThemeColors
): ColumnStat[] {
  const statsMap = new Map<string, { value: number; color: string }>();

  tasks.forEach((task) => {
    const column = columns.find((c) => c.id === task.columnId);
    if (!column) return;

    const colorKey = column.color || "gray";
    const color = getThemeColor(colorKey, colors);
    const current = statsMap.get(column.title) ?? { value: 0, color };
    statsMap.set(column.title, { value: current.value + 1, color });
  });

  return Array.from(statsMap.entries()).map(([label, data]) => ({
    label,
    value: data.value,
    color: data.color,
  }));
}

function calcCompletionPercent(priorities: ColumnStat[], total: number): number {
  if (total === 0) return 0;
  const completed = priorities.find((p) =>
    p.label.toLowerCase().includes("complet") || p.label.toLowerCase().includes("done")
  );
  return completed ? Math.round((completed.value / total) * 100) : 0;
}

export function PriorityBreakdown({ openModal }: { openModal: () => void }) {
  const { tasks, columns } = useKanbanStore();
  const { projects, loadProjects } = useProjectStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const themeName = settings.colorScheme || "Base16 Default";
  const isDarkMode =
    settings.theme === "dark" ||
    (settings.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const theme = themes.find((t) => t.name === themeName);
  const colors = isDarkMode ? theme?.dark : theme?.light;

  const priorities = colors ? buildColumnStats(tasks, columns, colors) : [];
  const total = tasks.length;
  const completionPercent = calcCompletionPercent(priorities, total);

  const chartData = {
    labels: priorities.map((p) => p.label),
    datasets: [
      {
        data: priorities.map((p) => p.value),
        backgroundColor: priorities.map((p) => p.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: "80%",
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  const topProjects = [...projects]
    .filter((p) => p.status !== "Completed")
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const greenColor = colors?.green ?? "#22c55e";

  return (
    <div className="priority-breakdown">
      <h3>Project Status</h3>

      {projects.length === 0 ? (
        <div className="empty-state" style={{border: 'none', background: 'none', padding: '0'}}>
          <div className="empty-state-illustration">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3>No projects yet</h3>
          <p>Create a project to start tracking your status.</p>
          <button className="btn-primary" onClick={openModal}>
            Create your first project
          </button>
        </div>
      ) : total === 0 ? (
        <div className="empty-state" style={{border: 'none', background: 'none', padding: '0'}}>
          <div className="empty-state-illustration">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3>No tasks yet</h3>
          <p>Add tasks to your project to start tracking progress.</p>
        </div>
      ) : (
        <div className="priority-chart-container">
          <div className="donut-chart">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="donut-center-text">
              <span className="donut-number">{completionPercent}%</span>
              <span className="donut-label">COMPLETE</span>
            </div>
          </div>
          <div className="priority-legend">
            {priorities.map(({ label, value, color }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={label} className="legend-item">
                  <span className="dot" style={{ backgroundColor: color }} />
                  <span className="legend-label">{label}:</span>
                  <span className="legend-value">
                    {value} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {total > 0 && topProjects.length > 0 && (
        <div className="top-projects-section">
          <h4 className="top-projects-title">Top active projects</h4>
          {topProjects.map((project) => (
            <div key={project.id} className="top-project-item">
              <div className="top-project-header">
                <span className="top-project-name">{project.name}</span>
                <span className="top-project-pct">{project.progress}%</span>
              </div>
              <div className="top-project-bar-track">
                <div
                  className="top-project-bar-fill"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor: greenColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
