import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * Shared shell for public-facing and customer-facing routes.
 * Admin and in-app "focus" flows (e.g. chat, active job tracking)
 * use their own layouts defined alongside those features.
 */
export function MainLayout() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
