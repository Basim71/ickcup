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
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-16">
        <div className="glass mx-auto w-full max-w-xl rounded-2xl border border-border p-5 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:p-10">
          <div className="mb-4 flex justify-center sm:mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-primary sm:px-4 sm:py-1.5 sm:text-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Booking
            </span>
          </div>
          <h1 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {settings.texts_en.selectLanguage} / {settings.texts_ar.selectLanguage}
          </h1>
          <p className="mt-2 text-center text-xs text-muted-foreground sm:mt-3 sm:text-sm">
            Please choose your preferred language to continue.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
            <Link
              to="/book"
              search={{ lang: "ar" }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-glow)] sm:rounded-2xl sm:p-6"
            >
              <div className="text-lg font-semibold sm:text-2xl" dir="rtl">العربية</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">Arabic</div>
            </Link>
            <Link
              to="/book"
              search={{ lang: "en" }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-glow)] sm:rounded-2xl sm:p-6"
            >
              <div className="text-lg font-semibold sm:text-2xl">English</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">الإنجليزية</div>
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
