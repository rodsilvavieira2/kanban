import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SummaryCards,
  PriorityBreakdown,
  ActivityFeed,
} from "../features/dashboard";

export function Dashboard() {
  const { t } = useTranslation();
  const { openModal } = useOutletContext<{ openModal: () => void }>();

  return (
    <main className="main-content">
      <div className="top-header">
        <h1>{t("dashboard.title")}</h1>
      </div>
      <div className="dashboard-content">
        <SummaryCards />
        <div className="dashboard-lower">
          <PriorityBreakdown openModal={openModal} />
          <ActivityFeed />
        </div>
      </div>
    </main>
  );
}
