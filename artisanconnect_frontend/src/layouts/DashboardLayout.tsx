import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageTitleProvider, usePageTitleContext } from "@/hooks/usePageTitle";
import { useChatHubConnection } from "@/features/chat/useChatHubConnection";
import styles from "./DashboardLayout.module.css";

function DashboardShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { title } = usePageTitleContext();
  useChatHubConnection();

  return (
    <div className={styles.shell}>
      <div
        className={`${styles.sidebarWrap} ${isMobileNavOpen ? styles.sidebarOpen : ""}`}
      >
        <Sidebar />
      </div>

      {isMobileNavOpen && (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Close menu"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <div className={styles.main}>
        <Topbar title={title} onMenuClick={() => setIsMobileNavOpen(true)} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/**
 * Shared shell for every authenticated route (customer + artisan
 * dashboards, profiles, jobs, bidding). Wraps children in PageTitleProvider
 * so any page can set the Topbar heading via `usePageTitle("...")`.
 */
export function DashboardLayout() {
  return (
    <PageTitleProvider>
      <DashboardShell />
    </PageTitleProvider>
  );
}
