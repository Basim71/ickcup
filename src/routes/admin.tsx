import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, QrCode, Settings as SettingsIcon, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV: { to: "/admin" | "/admin/bookings" | "/admin/qr" | "/admin/settings"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/qr", label: "QR Code", icon: QrCode },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = pathname === "/admin/auth";

  if (isAuthPage) {
    return <Outlet />;
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/auth";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/admin" className="text-sm font-semibold tracking-tight">
            Admin
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
