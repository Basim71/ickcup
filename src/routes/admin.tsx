import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  QrCode,
  Settings as SettingsIcon,
  CalendarDays,
  Moon,
  Sun,
  LogOut,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ThemeProvider scope="admin">
      <AdminLayout />
    </ThemeProvider>
  ),
});

function AdminLayout() {
  const { loading, isAdmin, email } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = pathname === "/admin/auth";

  useEffect(() => {
    if (loading) return;
    if (!isAdmin && !isAuthPage) navigate({ to: "/admin/auth" });
    if (isAdmin && isAuthPage) navigate({ to: "/admin" });
  }, [loading, isAdmin, isAuthPage, navigate]);

  if (isAuthPage) return <Outlet />;

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AdminShell email={email}><Outlet /></AdminShell>;
}

function AdminShell({ children, email }: { children: React.ReactNode; email: string | null }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/auth" });
  };

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
    { to: "/admin/qr", label: "QR Code", icon: QrCode },
    { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-6 py-6">
          <div className="text-sm font-semibold uppercase tracking-widest text-sidebar-primary">Admin</div>
          <div className="mt-1 text-xs text-muted-foreground">Booking control center</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent/60"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="px-3 py-2 text-xs text-muted-foreground">{email}</div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur md:px-8">
          <MobileNav nav={nav} />
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-lg border border-border bg-background p-2 transition-colors hover:bg-accent"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function MobileNav({
  nav,
}: {
  nav: readonly { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[];
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto md:hidden">
      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: n.exact }}
          activeProps={{ className: "bg-accent text-accent-foreground" }}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs"
        >
          <n.icon className="h-3.5 w-3.5" />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
