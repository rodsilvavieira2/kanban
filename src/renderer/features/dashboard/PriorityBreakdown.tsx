import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Priority {
  label: string;
  value: number;
  color: string;
}

const PRIORITIES: Priority[] = [
  { label: 'High',   value: 8,  color: '#E05C75' },
  { label: 'Medium', value: 24, color: '#E8A838' },
  { label: 'Low',    value: 16, color: '#4BB5CE' },
];

const TOTAL = PRIORITIES.reduce((sum, p) => sum + p.value, 0);

export function PriorityBreakdown() {
  const chartData = {
    labels: PRIORITIES.map(p => p.label),
    datasets: [
      {
        data: PRIORITIES.map(p => p.value),
        backgroundColor: PRIORITIES.map(p => p.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '80%',
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

  return (
    <div className="priority-breakdown">
      <h3>Priority Breakdown</h3>
      <div className="priority-chart-container">
        <div className="donut-chart">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="donut-center-text">
            <span className="donut-number">{TOTAL}</span>
            <span className="donut-label">TOTAL TASKS</span>
          </div>
        </div>

        <div className="priority-legend">
          {PRIORITIES.map(({ label, value, color }) => (
            <div key={label} className="legend-item">
              <span className="dot" style={{ backgroundColor: color }} />
              <span className="legend-label">{label}</span>
              <span className="legend-value">{value}</span>
            </div>
          ))}
          <p className="priority-note">
            Most tasks are currently at <strong>Medium</strong> priority level.
          </p>
        </div>
      </div>
    </div>
  );
}
