import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteTexts = {
  title?: string;
  subtitle?: string;
  fullNameLabel?: string;
  mobileLabel?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  selectLanguage?: string;
};

export type SiteSettings = {
  id: string;
  contact_phone: string | null;
  background_image: string | null;
  booking_url: string | null;
  texts_ar: SiteTexts;
  texts_en: SiteTexts;
};

const DEFAULT_AR: SiteTexts = {
  title: "احجز موعدك",
  subtitle: "نتطلع لاستقبالك. يرجى تعبئة بياناتك أدناه.",
  fullNameLabel: "الاسم الكامل",
  mobileLabel: "رقم الجوال",
  submitLabel: "تأكيد الحجز",
  successTitle: "تم استلام حجزك",
  successMessage: "شكراً لك. سنتواصل معك قريباً لتأكيد التفاصيل.",
  selectLanguage: "اختر اللغة",
};
const DEFAULT_EN: SiteTexts = {
  title: "Book Your Appointment",
  subtitle: "We look forward to welcoming you. Please fill in your details.",
  fullNameLabel: "Full Name",
  mobileLabel: "Mobile Number",
  submitLabel: "Confirm Booking",
  successTitle: "Booking received",
  successMessage: "Thank you. We will contact you shortly to confirm the details.",
  selectLanguage: "Choose your language",
};

export function withDefaults(s: SiteSettings | null): SiteSettings {
  return {
    id: s?.id ?? "",
    contact_phone: s?.contact_phone ?? null,
    background_image: s?.background_image ?? null,
    booking_url: s?.booking_url ?? null,
    texts_ar: { ...DEFAULT_AR, ...(s?.texts_ar ?? {}) },
    texts_en: { ...DEFAULT_EN, ...(s?.texts_en ?? {}) },
  };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => withDefaults(null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (mounted) {
        setSettings(withDefaults(data as unknown as SiteSettings | null));
        setLoading(false);
      }
    };
    fetchSettings();

    const channel = supabase
      .channel("settings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () =>
        fetchSettings(),
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading };
}
