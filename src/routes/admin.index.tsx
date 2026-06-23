import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, QrCode, Settings as SettingsIcon, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = { total: number; today: number; week: number; arabic: number; english: number };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("bookings").select("language, created_at");
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total bookings" value={stats?.total ?? "—"} />
        <StatCard icon={TrendingUp} label="Today" value={stats?.today ?? "—"} />
        <StatCard icon={CalendarDays} label="This week" value={stats?.week ?? "—"} />
        <StatCard
          icon={Users}
          label="AR / EN"
          value={stats ? `${stats.arabic} / ${stats.english}` : "—"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink to="/admin/bookings" icon={CalendarDays} title="Bookings" desc="View, export, manage" />
        <QuickLink to="/admin/qr" icon={QrCode} title="QR Code" desc="Generate & download QR" />
        <QuickLink to="/admin/settings" icon={SettingsIcon} title="Settings" desc="Site & contact" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
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
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-soft)]"
    >
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </Link>
  );
}
