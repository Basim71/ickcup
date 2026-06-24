import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Check, Phone } from "lucide-react";
import { useSiteSettings, withCacheBust } from "@/lib/settings";

export const Route = createFileRoute("/success")({
  validateSearch: z.object({ lang: z.enum(["ar", "en"]).catch("en") }),
  head: () => ({ meta: [{ title: "Confirmed" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { lang } = Route.useSearch();
  const { settings } = useSiteSettings();
  const t = lang === "ar" ? settings.texts_ar : settings.texts_en;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const bg = settings.background_image;

  return (
    <div
      dir={dir}
      className="font-public relative flex min-h-[100dvh] flex-col bg-neutral-50"
      style={{
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {bg && <div className="absolute inset-0 bg-black/15" />}
      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-12 sm:py-16">
        <div className="w-full max-w-md rounded-[22px] border border-black/5 bg-white p-8 text-center shadow-[0_24px_70px_-32px_rgba(20,20,30,0.45)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900">
            <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="mt-6 text-[24px] font-semibold tracking-tight text-neutral-900">
            {t.successTitle}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-neutral-500">
            {t.successMessage}
          </p>

          {settings.contact_phone && (
            <a
              href={`tel:${settings.contact_phone}`}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">{settings.contact_phone}</span>
            </a>
          )}

          <div className="mt-7 border-t border-neutral-100 pt-5">
            <Link
              to="/"
              className="text-[13px] text-neutral-400 underline-offset-4 transition-colors hover:text-neutral-700 hover:underline"
            >
              {lang === "ar" ? "العودة للرئيسية" : "Back to home"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
