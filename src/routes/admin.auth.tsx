import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const Route = createFileRoute("/admin/auth")({
  component: AdminAuthPage,
});

function AdminAuthPage() {
  const navigate = useNavigate();
  const { loading, userId, isAdmin } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only an actual admin is sent into the dashboard. A signed-in non-admin
  // stays here and sees the message below — this prevents the /admin <-> /admin/auth
  // redirect loop that happened when any session triggered a redirect to /admin.
  useEffect(() => {
    if (!loading && isAdmin) navigate({ to: "/admin" });
  }, [loading, isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Role resolves via useAdminAuth; the effect above redirects admins.
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-hero">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Signed in but NOT an admin: clear message instead of bouncing between routes.
  if (userId && !isAdmin) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-hero px-4">
        <div className="glass w-full max-w-md rounded-3xl border border-border p-8 text-center shadow-[var(--shadow-soft)]">
          <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
          <h1 className="mt-3 text-xl font-semibold tracking-tight">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is signed in but doesn't have admin access.
          </p>
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] items-center justify-center overflow-y-auto bg-hero px-4 py-8 sm:px-6 sm:py-16">
      <div className="glass w-full max-w-md rounded-2xl border border-border p-5 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">Admin</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Restricted area. Authorized personnel only.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
