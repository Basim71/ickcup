import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, QrCode, Settings as SettingsIcon, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

type Stats = { total: number; today: number; week: number; arabic: number; english: number };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from("bookings")
        .select("language, created_at");
      if (err) {
        setError(err.message);
        return;
      }
      const rows = data ?? [];
      const now = Date.now();
      const dayMs = 86_400_000;
      setStats({
        total: rows.length,
        today: rows.filter((r) => now - new Date(r.created_at as string).getTime() < dayMs).length,
        week: rows.filter((r) => now - new Date(r.created_at as string).getTime() < 7 * dayMs).length,
        arabic: rows.filter((r) => r.language === "ar").length,
        english: rows.filter((r) => r.language === "en").length,
      });
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of bookings and quick actions.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Couldn't load stats: {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total bookings" value={stats ? stats.total : "—"} />
        <Metric label="Today" value={stats ? stats.today : "—"} />
        <Metric label="This week" value={stats ? stats.week : "—"} />
        <Metric label="Arabic / English" value={stats ? `${stats.arabic} / ${stats.english}` : "—"} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <QuickLink to="/admin/bookings" icon={CalendarDays} title="Bookings" desc="View, export, manage" />
          <QuickLink to="/admin/qr" icon={QrCode} title="QR code" desc="Generate & download" />
          <QuickLink to="/admin/settings" icon={SettingsIcon} title="Settings" desc="Site & contact" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-secondary px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: "/admin/bookings" | "/admin/qr" | "/admin/settings";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent"
    >
      <div>
        <Icon className="h-5 w-5 text-foreground" />
        <div className="mt-3 font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}
