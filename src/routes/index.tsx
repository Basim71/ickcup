import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Sparkles } from "lucide-react";
import { useSiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Booking — Choose your language" },
      { name: "description", content: "Select your preferred language to book an appointment." },
    ],
  }),
  component: LanguagePage,
});

function LanguagePage() {
  const { settings } = useSiteSettings();
  const bg = settings.background_image;
  return (
    <div
      className="relative flex min-h-screen flex-col bg-hero"
      style={
        bg
          ? {
              backgroundImage: `linear-gradient(180deg, oklch(0 0 0 / 0.45), oklch(0 0 0 / 0.55)), url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="glass mx-auto w-full max-w-xl rounded-3xl border border-border p-10 shadow-[var(--shadow-soft)]">
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Booking
            </span>
          </div>
          <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {settings.texts_en.selectLanguage} / {settings.texts_ar.selectLanguage}
          </h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Please choose your preferred language to continue.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="/book"
              search={{ lang: "ar" }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-glow)]"
            >
              <div className="text-2xl font-semibold" dir="rtl">العربية</div>
              <div className="mt-1 text-xs text-muted-foreground">Arabic</div>
            </Link>
            <Link
              to="/book"
              search={{ lang: "en" }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-glow)]"
            >
              <div className="text-2xl font-semibold">English</div>
              <div className="mt-1 text-xs text-muted-foreground">الإنجليزية</div>
            </Link>
          </div>
        </div>
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
