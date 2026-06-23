import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Phone } from "lucide-react";
import { useSiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/success")({
  validateSearch: z.object({ lang: z.enum(["ar", "en"]).catch("en") }),
  head: () => ({ meta: [{ title: "Booking confirmed" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { lang } = Route.useSearch();
  const { settings } = useSiteSettings();
  const t = lang === "ar" ? settings.texts_ar : settings.texts_en;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="flex min-h-screen flex-col bg-hero" dir={dir}>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="glass w-full max-w-lg rounded-3xl border border-border p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t.successTitle}</h1>
          <p className="mt-3 text-muted-foreground">{t.successMessage}</p>

          {settings.contact_phone && (
            <a
              href={`tel:${settings.contact_phone}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              {settings.contact_phone}
            </a>
          )}

          <div className="mt-8">
            <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              {lang === "ar" ? "العودة للرئيسية" : "Back to home"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
