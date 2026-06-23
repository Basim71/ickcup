import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Upload, Trash2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, withDefaults, type SiteSettings, type SiteTexts } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import languageBg from "@/assets/language-bg.jpeg.asset.json";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings: live } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(withDefaults(null));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => setDraft(live), [live.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaving(true);
    const payload = {
      contact_phone: draft.contact_phone,
      background_image: draft.background_image,
      language_background: draft.language_background,
      booking_url: draft.booking_url,
      texts_ar: draft.texts_ar as never,
      texts_en: draft.texts_en as never,
    };
    let id = draft.id || live.id;
    if (id) {
      await supabase.from("settings").update(payload).eq("id", id);
    } else {
      const { data } = await supabase.from("settings").insert(payload).select("id").single();
      id = data?.id ?? "";
    }
    await logAudit("update_settings", "settings");
    setSavedAt(Date.now());
    setSaving(false);
  };

  const onImage = async (
    file: File,
    field: "background_image" | "language_background",
  ) => {
    if (file.size > 4_000_000) {
      alert("Image must be under 4 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setDraft((d) => ({ ...d, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Website Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Changes apply across the booking site instantly.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </div>
      {savedAt && (
        <p className="text-xs text-primary">Saved at {new Date(savedAt).toLocaleTimeString()}</p>
      )}

      <Section title="Contact" desc="Shown on language, booking, and success pages.">
        <Field label="Contact phone number">
          <input
            type="tel"
            value={draft.contact_phone ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, contact_phone: e.target.value }))}
            placeholder="+1 555 123 4567"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
          />
        </Field>
        {draft.contact_phone && (
          <button
            onClick={() => setDraft((d) => ({ ...d, contact_phone: null }))}
            className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
          >
            <Trash2 className="h-3 w-3" /> Remove phone
          </button>
        )}
      </Section>

      <Section title="Background Image" desc="Used on language and booking pages. JPG or PNG, under 4 MB.">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm hover:bg-accent">
            <Upload className="h-4 w-4" />
            Upload from PC
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImage(e.target.files[0])}
            />
          </label>
          {draft.background_image && (
            <button
              onClick={() => setDraft((d) => ({ ...d, background_image: null }))}
              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <Trash2 className="h-3 w-3" /> Remove image
            </button>
          )}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Live preview — booking page
          </p>
          <BookingPreview
            bg={draft.background_image}
            title={draft.texts_en.title || draft.texts_ar.title || ""}
            subtitle={draft.texts_en.subtitle ?? ""}
            fullNameLabel={draft.texts_en.fullNameLabel ?? "Full Name"}
            mobileLabel={draft.texts_en.mobileLabel ?? "Mobile Number"}
            submitLabel={draft.texts_en.submitLabel ?? "Confirm"}
            phone={draft.contact_phone}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Changes shown here are not saved until you click <b>Save changes</b>.
          </p>
        </div>
      </Section>

      <Section title="Booking URL" desc="Used to generate the QR code.">
        <input
          value={draft.booking_url ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, booking_url: e.target.value }))}
          placeholder={typeof window !== "undefined" ? window.location.origin : ""}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
        />
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <TextsEditor
          title="Arabic Texts"
          dir="rtl"
          texts={draft.texts_ar}
          onChange={(t) => setDraft((d) => ({ ...d, texts_ar: t }))}
        />
        <TextsEditor
          title="English Texts"
          dir="ltr"
          texts={draft.texts_en}
          onChange={(t) => setDraft((d) => ({ ...d, texts_en: t }))}
        />
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

const TEXT_FIELDS: { key: keyof SiteTexts; label: string }[] = [
  { key: "selectLanguage", label: "Select Language Label" },
  { key: "title", label: "Booking Title" },
  { key: "subtitle", label: "Booking Subtitle" },
  { key: "fullNameLabel", label: "Full Name Label" },
  { key: "mobileLabel", label: "Mobile Number Label" },
  { key: "submitLabel", label: "Submit Button" },
  { key: "successTitle", label: "Success Title" },
  { key: "successMessage", label: "Success Message" },
];

function TextsEditor({
  title,
  dir,
  texts,
  onChange,
}: {
  title: string;
  dir: "ltr" | "rtl";
  texts: SiteTexts;
  onChange: (t: SiteTexts) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3" dir={dir}>
        {TEXT_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs text-muted-foreground" dir="ltr">
              {f.label}
            </label>
            <input
              value={texts[f.key] ?? ""}
              onChange={(e) => onChange({ ...texts, [f.key]: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingPreview({
  bg,
  title,
  subtitle,
  fullNameLabel,
  mobileLabel,
  submitLabel,
  phone,
}: {
  bg: string | null;
  title: string;
  subtitle: string;
  fullNameLabel: string;
  mobileLabel: string;
  submitLabel: string;
  phone: string | null;
}) {
  const image = bg || languageBg.url;
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#ffffff",
        aspectRatio: "9 / 16",
        maxHeight: "520px",
      }}
    >
      <div className="absolute inset-0 flex flex-col">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-[260px] rounded-2xl border border-white/40 bg-white/85 p-4 shadow-xl backdrop-blur">
            {title && (
              <div className="text-base font-semibold tracking-tight text-foreground">{title}</div>
            )}
            {subtitle && <div className="mt-1 text-[11px] text-muted-foreground">{subtitle}</div>}
            <div className="mt-3 space-y-2">
              <div>
                <div className="mb-1 text-[10px] font-medium text-foreground">{fullNameLabel}</div>
                <div className="h-7 rounded-md border border-input bg-background" />
              </div>
              <div>
                <div className="mb-1 text-[10px] font-medium text-foreground">{mobileLabel}</div>
                <div className="h-7 rounded-md border border-input bg-background" />
              </div>
            </div>
            <div className="mt-3 grid h-8 place-items-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
              {submitLabel}
            </div>
          </div>
        </div>
        {phone && (
          <div className="flex justify-center pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[10px] text-foreground backdrop-blur">
              <Phone className="h-3 w-3" />
              {phone}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
