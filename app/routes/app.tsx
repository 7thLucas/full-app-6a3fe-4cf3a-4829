import { Outlet } from "react-router";
import { SidebarNav, MobileNav } from "~/components/sidebar-nav";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <SidebarNav />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
