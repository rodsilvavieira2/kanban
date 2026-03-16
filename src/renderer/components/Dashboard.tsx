import {
  SummaryCards,
  PriorityBreakdown,
  ActivityFeed,
} from "../features/dashboard";

export function Dashboard() {
  return (
    <main className="main-content">
      <div className="top-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <SummaryCards />
        <div className="dashboard-lower">
          <PriorityBreakdown />
          <ActivityFeed />
        </div>
      </div>
    </main>
  );
}
