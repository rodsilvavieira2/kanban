interface CardData {
  label: string;
  value: number;
  trend: string;
  trendType: 'positive' | 'neutral';
  iconClass: string;
  icon: React.ReactNode;
}

const CARDS: CardData[] = [
  {
    label: 'Total Tasks',
    value: 128,
    trend: '↑ 12% this week',
    trendType: 'positive',
    iconClass: '',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    label: 'In Progress',
    value: 32,
    trend: '→ 0% this week',
    trendType: 'neutral',
    iconClass: 'in-progress',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Completed',
    value: 84,
    trend: '↑ 8% this week',
    trendType: 'positive',
    iconClass: 'completed',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export function SummaryCards() {
  return (
    <div className="summary-cards">
      {CARDS.map((card) => (
        <div key={card.label} className="card">
          <div className={`card-header ${card.iconClass}`.trim()}>{card.icon}</div>
          <h4>{card.label}</h4>
          <h2 className="tabular-nums">{card.value}</h2>
          <p className={`trend ${card.trendType}`}>{card.trend}</p>
        </div>
      ))}
    </div>
  );
}
