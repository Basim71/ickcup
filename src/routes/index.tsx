import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Sparkles } from "lucide-react";
import { useSiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Choose your language" },
      { name: "description", content: "Select your preferred language to book an appointment." },
    ],
  }),
  component: LanguagePage,
});

function LanguagePage() {
  const { settings } = useSiteSettings();
  const bg = settings.language_background;
  return (
    <div
      className="relative flex min-h-[100dvh] flex-col"
      style={{
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-[13vh] sm:px-6 sm:py-16">
        <div className="glass-strong mx-auto w-full max-w-xl rounded-3xl border border-white/20 p-6 shadow-2xl sm:p-10">
          <div className="mb-4 flex justify-center sm:mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-primary sm:px-4 sm:py-1.5 sm:text-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Welcome
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
              className="group relative overflow-hidden rounded-2xl border border-white/30 bg-card/70 p-4 text-center backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-card/90 hover:shadow-[var(--shadow-glow)] sm:p-6"
            >
              <div className="text-lg font-semibold sm:text-2xl" dir="rtl">العربية</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">Arabic</div>
            </Link>
            <Link
              to="/book"
              search={{ lang: "en" }}
              className="group relative overflow-hidden rounded-2xl border border-white/30 bg-card/70 p-4 text-center backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-card/90 hover:shadow-[var(--shadow-glow)] sm:p-6"
            >
              <div className="text-lg font-semibold sm:text-2xl">English</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">الإنجليزية</div>
            </Link>
          </div>
        </div>
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
