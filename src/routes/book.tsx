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
    meta: [{ title: "Your details" }],
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
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-16">
        <form
          onSubmit={onSubmit}
          className="glass w-full max-w-md rounded-2xl border border-border p-5 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:p-8"
        >
          {t.title && <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>}
          <p className={`text-xs text-muted-foreground sm:text-sm ${t.title ? "mt-1 sm:mt-2" : ""}`}>{t.subtitle}</p>

          <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-5">
            <div>
              <label className="mb-1 block text-xs font-medium sm:mb-1.5 sm:text-sm">{t.fullNameLabel}</label>
              <input
                name="full_name"
                required
                maxLength={120}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 sm:rounded-xl sm:px-4 sm:py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium sm:mb-1.5 sm:text-sm">{t.mobileLabel}</label>
              <input
                name="mobile_number"
                required
                maxLength={30}
                inputMode="tel"
                dir="ltr"
                placeholder="+1 555 123 4567"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 sm:rounded-xl sm:px-4 sm:py-3"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive sm:mt-4 sm:text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)] disabled:opacity-60 sm:mt-8 sm:rounded-xl sm:py-3"
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
