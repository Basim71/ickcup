import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, withDefaults, type SiteSettings, type SiteTexts } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

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

  const onImage = async (file: File) => {
    if (file.size > 4_000_000) {
      alert("Image must be under 4 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setDraft((d) => ({ ...d, background_image: reader.result as string }));
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

      <Section title="Background Image" desc="Used on public pages. JPG or PNG, under 4 MB.">
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
        {draft.background_image && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <img src={draft.background_image} alt="Background preview" className="h-48 w-full object-cover" />
          </div>
        )}
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
