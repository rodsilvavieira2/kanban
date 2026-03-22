import { useEffect, useState, use, Suspense, startTransition } from "react";
import { ActivityLog } from "../../../shared/schemas/models";
import { kanbanApi } from "../../api";

const getRelativeTime = (isoString?: string) => {
  if (!isoString) return "Unknown time";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const getIcon = (action: string) => {
  if (action.includes("Created")) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }
  if (action.includes("Moved")) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
};

const getActionClass = (action: string) => {
  if (action.includes("Created")) return "create";
  if (action.includes("Moved")) return "complete";
  return "update";
};

function ActivityFeedContent({ promise }: { promise: Promise<ActivityLog[]> }) {
  const activities = use(promise);

  if (activities.length === 0) {
    return (
      <div
        className="empty-state"
        style={{ border: "none", background: "none", padding: "0" }}
      >
        <div className="empty-state-illustration">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h3>No activity yet</h3>
        <p>Start working on your projects to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="activity-feed-content">
      <div className="activity-timeline">
        {activities.map((activity) => (
          <div key={activity.id} className="timeline-item">
            <div className={`timeline-icon ${getActionClass(activity.action)}`}>
              {getIcon(activity.action)}
            </div>
            <div className="timeline-content">
              <p>
                <strong>{activity.action}</strong>
                {activity.details && (
                  <span className="text-accents-5 d-block text-xs mt-1">
                    {activity.details}
                  </span>
                )}
              </p>
              <span className="time">
                {getRelativeTime(activity.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const [activitiesPromise, setActivitiesPromise] = useState(() =>
    kanbanApi.getRecentActivity(10),
  );

  useEffect(() => {
    let unsubscribe: (() => void) | void;
    if (kanbanApi?.onKanbanUpdated) {
      unsubscribe = kanbanApi.onKanbanUpdated(() => {
        startTransition(() => {
          setActivitiesPromise(kanbanApi.getRecentActivity(10));
        });
      });
    }
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="activity-feed">
      <h3>Recent Activity</h3>
      <Suspense
        fallback={<p className="text-accents-5 text-sm">Loading activity...</p>}
      >
        <ActivityFeedContent promise={activitiesPromise} />
      </Suspense>
    </div>
  );
}
