type ActivityType = 'complete' | 'update' | 'create';

interface Activity {
  id: string;
  type: ActivityType;
  description: React.ReactNode;
  time: string;
}

const ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'complete',
    description: (
      <>
        Task <strong>"API Integration"</strong> moved to{' '}
        <span className="status-keyword done">Done</span>
      </>
    ),
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'update',
    description: (
      <>
        Task <strong>"Design Mockups"</strong> was{' '}
        <span className="status-keyword updated">Updated</span>
      </>
    ),
    time: '5 hours ago',
  },
  {
    id: '3',
    type: 'create',
    description: (
      <>
        New task <strong>"User Testing"</strong> added to{' '}
        <span className="status-keyword backlog">Backlog</span>
      </>
    ),
    time: 'Yesterday',
  },
];

const ICONS: Record<ActivityType, React.ReactNode> = {
  complete: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  update: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  create: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

export function ActivityFeed() {
  return (
    <div className="activity-feed">
      <h3>Recent Activity</h3>
      <div className="activity-timeline">
        {ACTIVITIES.map((activity) => (
          <div key={activity.id} className="timeline-item">
            <div className={`timeline-icon ${activity.type}`}>
              {ICONS[activity.type]}
            </div>
            <div className="timeline-content">
              <p>{activity.description}</p>
              <span className="time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
