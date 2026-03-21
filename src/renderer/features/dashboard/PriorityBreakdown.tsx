import React, { useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { useKanbanStore } from "../../stores/kanbanStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useProjectStore } from "../../stores/projectStore";
import { themes } from "../../../shared/themes";
import { getThemeColor } from "../../utils/themeUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Priority {
  label: string;
  value: number;
  color: string;
}

export function PriorityBreakdown() {
  const { tasks, columns } = useKanbanStore();
  const { projects, loadProjects } = useProjectStore();
  const { settings } = useSettingsStore();
  
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const themeName = settings.colorScheme || "Base16 Default";
  const isDarkMode = settings.theme === "dark" || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const theme = themes.find((t) => t.name === themeName);
  const colors = isDarkMode ? theme?.dark : theme?.light;

  // Group tasks by column title to aggregate across projects
  const columnStats = new Map<string, { value: number; color: string }>();
  
  tasks.forEach((task) => {
    const column = columns.find((c) => c.id === task.columnId);
    if (column && colors) {
      const title = column.title;
      // Use the color key from the column to get the theme-aware color
      const colorKey = column.color || "gray";
      const color = getThemeColor(colorKey, colors);
      
      const current = columnStats.get(title) || { value: 0, color };
      columnStats.set(title, {
        value: current.value + 1,
        color
      });
    }
  });

  const priorities: Priority[] = Array.from(columnStats.entries()).map(([label, data]) => ({
    label,
    value: data.value,
    color: data.color,
  }));

  const total = tasks.length;
  
  // Calculate overall completion percentage
  const completedTasks = priorities.find(p => p.label.toLowerCase().includes('complete') || p.label.toLowerCase().includes('done'))?.value || 0;
  const completionPercentage = total > 0 ? Math.round((completedTasks / total) * 100) : 0;

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
    cutout: "75%",
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  // Top active projects (sort by progress descending, take top 3)
  const topProjects = [...projects]
    .filter(p => p.status !== "Completed")
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  // Theme colors for progress bars
  const projectColors = [
    colors?.green || "#00C853", 
    colors?.yellow || "#FFAB00", 
    colors?.blue || "#0070F3"
  ];

  return (
    <div className="priority-breakdown">
      <div className="priority-header">
        <h3>Project Status</h3>
        <p className="priority-subtitle">Variant 1: Visual Breakdown</p>
      </div>
      
      <div className="priority-chart-container">
        <div className="donut-chart">
          {total === 0 ? (
            <div className="empty-chart text-accents-5 text-sm p-4 text-center">
              No tasks
            </div>
          ) : (
            <Doughnut data={chartData} options={chartOptions} />
          )}
          <div className="donut-center-text">
            <span className="donut-number">{completionPercentage}%</span>
          </div>
        </div>

        <div className="priority-legend">
          {priorities.map(({ label, value, color }) => {
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={label} className="legend-item">
                <span className="dot" style={{ backgroundColor: color }} />
                <span className="legend-label">{label}:</span>
                <span className="legend-value">{value} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {topProjects.length > 0 && (
        <div className="top-projects-section">
          <h4>Top active projects</h4>
          <div className="top-projects-list">
            {topProjects.map((project, index) => {
              const barColor = projectColors[index % projectColors.length];
              return (
                <div key={project.id} className="top-project-item">
                  <div className="top-project-header">
                    <span className="top-project-name">{project.name}: {project.progress}% Completed</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: barColor
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
