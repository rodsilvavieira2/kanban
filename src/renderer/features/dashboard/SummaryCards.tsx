import React, { useEffect } from "react";
import { useKanbanStore } from "../../stores/kanbanStore";

export function SummaryCards() {
  const { tasks, columns, loadAllTasks, isLoading } = useKanbanStore();

  useEffect(() => {
    loadAllTasks();
  }, [loadAllTasks]);

  // Derive real stats from tasks and columns
  const totalTasks = tasks.length;

  // In-progress tasks: tasks in columns whose title contains "Progress" or "Doing"
  const inProgressColumnIds = new Set(
    columns.filter((c) => /progress|doing/i.test(c.title)).map((c) => c.id),
  );
  const inProgressTasks = tasks.filter((t) =>
    inProgressColumnIds.has(t.columnId),
  ).length;

  // Completed tasks: tasks in columns whose title contains "Done" or "Completed"
  const completedColumnIds = new Set(
    columns
      .filter((c) => /done|completed|complete/i.test(c.title))
      .map((c) => c.id),
  );
  const completedTasks = tasks.filter((t) =>
    completedColumnIds.has(t.columnId),
  ).length;

  const CARDS = [
    {
      label: "Total Tasks",
      value: totalTasks,
      trend: isLoading ? "Loading…" : `${totalTasks} across all projects`,
      trendType: "neutral" as const,
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      trend:
        totalTasks > 0
          ? `${Math.round((inProgressTasks / totalTasks) * 100)}% of total`
          : "No tasks yet",
      trendType: "neutral" as const,
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Completed",
      value: completedTasks,
      trend:
        totalTasks > 0
          ? `${Math.round((completedTasks / totalTasks) * 100)}% completion rate`
          : "No tasks yet",
      trendType: "positive" as const,
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="summary-cards">
      {CARDS.map((card) => (
        <div key={card.label} className="card">
          <div className="card-header">{card.icon}</div>
          <h4>{card.label}</h4>
          <h2 className="tabular-nums">{card.value}</h2>
          <p className={`trend ${card.trendType}`}>{card.trend}</p>
        </div>
      ))}
    </div>
  );
}
