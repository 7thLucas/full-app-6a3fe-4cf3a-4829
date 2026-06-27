import { NavLink, useLocation } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import {
  LayoutDashboard,
  Package,
  Share2,
  Clock,
  History,
  Zap,
} from "lucide-react";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/products", label: "Products", icon: Package },
  { to: "/app/platforms", label: "Platforms", icon: Share2 },
  { to: "/app/schedule", label: "Schedule", icon: Clock },
  { to: "/app/history", label: "History", icon: History },
];

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function SidebarNav() {
  const { config, loading } = useConfigurables();
  const appName = loading ? "PostPilot" : (config?.appName ?? "PostPilot");
  const logoUrl = config?.logoUrl ?? "";

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={appName} className="w-6 h-6 object-contain" />
          ) : (
            <Zap className="w-4 h-4 text-primary-foreground" />
          )}
        </div>
        <span className="font-bold text-sidebar-foreground text-lg leading-none" style={{ fontFamily: "var(--heading-font)" }}>
          {appName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          Automating your posts daily
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-50 flex md:hidden">
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
