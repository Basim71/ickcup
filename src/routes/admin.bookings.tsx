import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Trash2, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

type Booking = {
  id: string;
  full_name: string;
  mobile_number: string;
  language: string;
  created_at: string;
};

function BookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Booking[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter(
    (r) =>
      !q ||
      r.full_name.toLowerCase().includes(q.toLowerCase()) ||
      r.mobile_number.includes(q),
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        Name: r.full_name,
        Mobile: r.mobile_number,
        Language: r.language === "ar" ? "Arabic" : "English",
        Date: new Date(r.created_at).toLocaleString(),
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `bookings-${new Date().toISOString().slice(0, 10)}.xlsx`);
    logAudit("export_bookings", "bookings", { count: filtered.length });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    await logAudit("delete_booking", "bookings", { id });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} total {filtered.length !== rows.length && `· ${filtered.length} shown`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-glow)]"
          >
            <Download className="h-4 w-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or mobile..."
          className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{r.full_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.mobile_number}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                        {r.language === "ar" ? "Arabic" : "English"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
