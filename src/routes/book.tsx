import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";

const searchSchema = z.object({ lang: z.enum(["ar", "en"]).catch("en") });

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Book your appointment" }],
  }),
  component: BookPage,
});

const bookingSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  mobile_number: z
    .string()
    .trim()
    .min(4)
    .max(30)
    .regex(/^[+\d\s\-()]+$/, "Invalid phone format"),
});

function BookPage() {
  const { lang } = Route.useSearch();
  const { settings } = useSiteSettings();
  const t = lang === "ar" ? settings.texts_ar : settings.texts_en;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const parsed = bookingSchema.safeParse({
      full_name: form.get("full_name"),
      mobile_number: form.get("mobile_number"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from("bookings").insert({ ...parsed.data, language: lang });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate({ to: "/success", search: { lang } });
  };

  const bg = settings.background_image;
  return (
    <div
      className="relative flex min-h-screen flex-col bg-hero"
      dir={dir}
      style={
        bg
          ? {
              backgroundImage: `linear-gradient(180deg, oklch(0 0 0 / 0.5), oklch(0 0 0 / 0.6)), url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <form
          onSubmit={onSubmit}
          className="glass w-full max-w-md rounded-3xl border border-border p-8 shadow-[var(--shadow-soft)]"
        >
          <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.fullNameLabel}</label>
              <input
                name="full_name"
                required
                maxLength={120}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.mobileLabel}</label>
              <input
                name="mobile_number"
                required
                maxLength={30}
                inputMode="tel"
                dir="ltr"
                placeholder="+1 555 123 4567"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)] disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.submitLabel}
          </button>
        </form>
      </main>
      {settings.contact_phone && (
        <footer className="px-6 pb-8 text-center text-sm text-muted-foreground">
          <a
            href={`tel:${settings.contact_phone}`}
            className="inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-2 backdrop-blur"
          >
            <Phone className="h-4 w-4" />
            {settings.contact_phone}
          </a>
        </footer>
      )}
    </div>
  );
}
