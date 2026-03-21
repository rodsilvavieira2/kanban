import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { useKanbanStore } from "../../stores/kanbanStore";
import { useSettingsStore } from "../../stores/settingsStore";
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
  const { themeName, isDarkMode } = useSettingsStore();
  
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
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const sortedPriorities = [...priorities].sort((a, b) => b.value - a.value);
  const topPriority =
    sortedPriorities.length > 0 ? sortedPriorities[0].label : "None";

  return (
    <div className="priority-breakdown">
      <h3>Project Status</h3>
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
            <span className="donut-number">{total}</span>
            <span className="donut-label">TOTAL TASKS</span>
          </div>
        </div>

        <div className="priority-legend">
          {priorities.map(({ label, value, color }) => (
            <div key={label} className="legend-item">
              <span className="dot" style={{ backgroundColor: color }} />
              <span className="legend-label">{label}</span>
              <span className="legend-value">{value}</span>
            </div>
          ))}
          <p className="priority-note">
            Most tasks are currently in <strong>{topPriority}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
