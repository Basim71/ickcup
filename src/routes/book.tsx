import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import languageBg from "@/assets/language-bg.jpeg.asset.json";

const searchSchema = z.object({ lang: z.enum(["ar", "en"]).catch("en") });

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Your details" }],
  }),
  component: BookPage,
});

const bookingSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(60),
  last_name: z.string().trim().min(1, "Last name is required").max(60),
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
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      mobile_number: form.get("mobile_number"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const full_name = `${parsed.data.first_name} ${parsed.data.last_name}`.trim();
    const { error: err } = await supabase
      .from("bookings")
      .insert({ full_name, mobile_number: parsed.data.mobile_number, language: lang });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate({ to: "/success", search: { lang } });
  };

  const bg = settings.background_image || languageBg.url;
  return (
    <div
      className="relative flex min-h-screen flex-col"
      dir={dir}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-16">
        <form
          onSubmit={onSubmit}
          className="glass-strong w-full max-w-md rounded-3xl border border-white/20 p-6 shadow-2xl sm:p-8"
        >
          {t.title && <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>}
          <p className={`text-xs text-muted-foreground sm:text-sm ${t.title ? "mt-1 sm:mt-2" : ""}`}>{t.subtitle}</p>

          <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium sm:mb-1.5 sm:text-sm">{t.firstNameLabel}</label>
                <input
                  name="first_name"
                  required
                  maxLength={60}
                  className="w-full rounded-xl border border-white/30 bg-background/80 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium sm:mb-1.5 sm:text-sm">{t.lastNameLabel}</label>
                <input
                  name="last_name"
                  required
                  maxLength={60}
                  className="w-full rounded-xl border border-white/30 bg-background/80 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3"
                />
              </div>
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
                className="w-full rounded-xl border border-white/30 bg-background/80 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive sm:mt-4 sm:text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-[var(--shadow-glow)] disabled:opacity-60 sm:mt-8"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.submitLabel}
          </button>
        </form>
      </main>
      {settings.contact_phone && (
        <footer className="relative px-6 pb-8 text-center text-sm">
          <a
            href={`tel:${settings.contact_phone}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-card/80 px-4 py-2 text-foreground backdrop-blur-md"
          >
            <Phone className="h-4 w-4" />
            {settings.contact_phone}
          </a>
        </footer>
      )}
    </div>
  );
}
