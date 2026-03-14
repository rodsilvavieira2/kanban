interface Priority {
  label: string;
  value: number;
  color: string;
  pct: number;
  offset: number;
}

const PRIORITIES: Priority[] = [
  { label: 'High',   value: 8,  color: '#E05C75', pct: 16.6, offset: 0     },
  { label: 'Medium', value: 24, color: '#E8A838', pct: 50,   offset: -16.6 },
  { label: 'Low',    value: 16, color: '#4BB5CE', pct: 33.4, offset: -66.6 },
];

const TOTAL = PRIORITIES.reduce((sum, p) => sum + p.value, 0);
const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

export function PriorityBreakdown() {
  return (
    <div className="priority-breakdown">
      <h3>Priority Breakdown</h3>
      <div className="priority-chart-container">
        <div className="donut-chart">
          <svg viewBox="0 0 36 36">
            <path className="circle-bg" d={RING_PATH} />
            {PRIORITIES.map(({ label, color, pct, offset }) => (
              <path
                key={label}
                className="circle"
                stroke={color}
                strokeDasharray={`${pct}, 100`}
                strokeDashoffset={offset !== 0 ? offset : undefined}
                d={RING_PATH}
              />
            ))}
            <text x="18" y="17.5" className="donut-number">{TOTAL}</text>
            <text x="18" y="21.5" className="donut-label">TOTAL TASKS</text>
          </svg>
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
