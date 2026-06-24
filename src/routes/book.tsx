import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Phone, Loader2, ChevronLeft } from "lucide-react";
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
  first_name: z.string().trim().min(1, "First name is required").max(60),
  last_name: z.string().trim().min(1, "Last name is required").max(60),
  mobile_number: z
    .string()
    .trim()
    .min(4)
    .max(30)
    .regex(/^[+\d\s\-()]+$/, "Invalid phone format"),
});

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

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

  const bg = settings.background_image;

  return (
    <div
      dir={dir}
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

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-[10vh] sm:px-6 sm:py-16">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_24px_70px_-32px_rgba(20,20,30,0.45)] sm:p-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[12px] text-neutral-400 transition-colors hover:text-neutral-700"
          >
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {lang === "ar" ? "تغيير اللغة" : "Change language"}
          </Link>

          {t.title && (
            <h1 className="mt-3 text-[21px] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-[25px]">
              {t.title}
            </h1>
          )}
          <p className={`text-[14px] text-neutral-500 ${t.title ? "mt-1" : "mt-3"}`}>{t.subtitle}</p>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-neutral-600">
                  {t.firstNameLabel}
                </label>
                <input name="first_name" required maxLength={60} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-neutral-600">
                  {t.lastNameLabel}
                </label>
                <input name="last_name" required maxLength={60} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-neutral-600">
                {t.mobileLabel}
              </label>
              <input
                name="mobile_number"
                required
                maxLength={30}
                inputMode="tel"
                dir="ltr"
                placeholder="+966 5X XXX XXXX"
                className={`${inputClass} text-start`}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.submitLabel}
          </button>
        </form>

        {settings.contact_phone && (
          <a
            href={`tel:${settings.contact_phone}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[13px] text-neutral-600 shadow-sm backdrop-blur transition-colors hover:text-neutral-900"
          >
            <Phone className="h-3.5 w-3.5" />
            <span dir="ltr">{settings.contact_phone}</span>
          </a>
        )}
      </main>
    </div>
  );
}
