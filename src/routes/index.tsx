import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Choose your language" },
      { name: "description", content: "Select your preferred language to continue your booking." },
    ],
  }),
  component: LanguagePage,
});

function LanguagePage() {
  const { settings } = useSiteSettings();
  const bg = settings.language_background;

  return (
    <div
      dir="ltr"
      className="font-public relative flex min-h-[100dvh] flex-col"
      style={{
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "#ffffff",
      }}
    >
      {bg && <div className="absolute inset-0 bg-black/15" />}

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-[13vh] sm:px-6 sm:py-16">
        <div className="w-full max-w-md rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_24px_70px_-32px_rgba(20,20,30,0.45)] sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          </p>

          <h1 className="mt-3 text-[21px] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-[25px]">
            {settings.texts_en.selectLanguage}
          </h1>
          <p dir="rtl" className="mt-1 text-[14px] text-neutral-500">
            {settings.texts_ar.selectLanguage}
          </p>

          <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-2xl border border-neutral-200">
            <Link
              to="/book"
              search={{ lang: "ar" }}
              dir="rtl"
              aria-label="العربية — Arabic"
              className="group flex flex-col items-center gap-1 px-4 py-7 text-center transition-colors duration-200 hover:bg-neutral-900 focus-visible:bg-neutral-900 focus-visible:outline-none active:bg-neutral-900"
            >
              <span className="text-[21px] font-semibold text-neutral-900 transition-colors group-hover:text-white group-focus-visible:text-white group-active:text-white">
                العربية
              </span>
              <span className="text-[12px] text-neutral-400 transition-colors group-hover:text-white/65 group-focus-visible:text-white/65 group-active:text-white/65">
                Arabic
              </span>
            </Link>
            <Link
              to="/book"
              search={{ lang: "en" }}
              aria-label="English"
              className="group flex flex-col items-center gap-1 border-l border-neutral-200 px-4 py-7 text-center transition-colors duration-200 hover:bg-neutral-900 focus-visible:bg-neutral-900 focus-visible:outline-none active:bg-neutral-900"
            >
              <span className="text-[21px] font-semibold text-neutral-900 transition-colors group-hover:text-white group-focus-visible:text-white group-active:text-white">
                English
              </span>
              <span className="text-[12px] text-neutral-400 transition-colors group-hover:text-white/65 group-focus-visible:text-white/65 group-active:text-white/65">
                الإنجليزية
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
