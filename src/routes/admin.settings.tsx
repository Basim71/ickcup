import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Upload, Trash2, Phone, Link2, Image as ImageIcon, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, withDefaults, withCacheBust, type SiteSettings, type SiteTexts } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings: live } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(withDefaults(null));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Keep the draft in sync whenever the live record id changes (first load or first insert).
  useEffect(() => setDraft(live), [live.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    const payload = {
      contact_phone: draft.contact_phone,
      background_image: draft.background_image,
      language_background: draft.language_background,
      booking_url: draft.booking_url,
      texts_ar: draft.texts_ar as never,
      texts_en: draft.texts_en as never,
    };
    let id = draft.id || live.id;
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        throw new Error("You're signed out. Please sign in again as an admin.");
      }
      if (id) {
        const { data, error } = await supabase
          .from("settings")
          .update(payload)
          .eq("id", id)
          .select("id");
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(
            "Saved nothing — your account is not allowed to edit settings (admin role required).",
          );
        }
      } else {
        const { data, error } = await supabase
          .from("settings")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        id = data?.id ?? "";
        setDraft((d) => ({ ...d, id }));
      }
      await logAudit("update_settings", "settings");
      setSavedAt(Date.now());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save settings";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
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
      {saveError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {saveError}
        </p>
      )}
      {savedAt && !saveError && (
        <p className="text-xs text-primary">
          Saved at {new Date(savedAt).toLocaleTimeString()} — changes are live across the site.
        </p>
      )}

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4" /> <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="gap-2">
            <ImageIcon className="h-4 w-4" /> <span className="hidden sm:inline">Backgrounds</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Link2 className="h-4 w-4" /> <span className="hidden sm:inline">Booking URL</span>
          </TabsTrigger>
          <TabsTrigger value="texts" className="gap-2">
            <Type className="h-4 w-4" /> <span className="hidden sm:inline">Texts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="mt-4">
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
        </TabsContent>

        <TabsContent value="backgrounds" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Booking Page Background" desc="Background image for the booking form. JPG/PNG, under 4 MB.">
              <ImageUploader
                value={draft.background_image}
                onPick={(f) => onImage(f, "background_image")}
                onClear={() => setDraft((d) => ({ ...d, background_image: null }))}
              />
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
                <BookingPreview
                  bg={withCacheBust(draft.background_image, draft.updated_at)}
                  title={draft.texts_en.title || draft.texts_ar.title || ""}
                  subtitle={draft.texts_en.subtitle ?? ""}
                  firstNameLabel={draft.texts_en.firstNameLabel ?? "First Name"}
                  lastNameLabel={draft.texts_en.lastNameLabel ?? "Last Name"}
                  mobileLabel={draft.texts_en.mobileLabel ?? "Mobile Number"}
                  submitLabel={draft.texts_en.submitLabel ?? "Confirm"}
                  phone={draft.contact_phone}
                />
              </div>
            </Section>

            <Section title="Language Page Background" desc="Background for the language selection page. Independent of the booking page.">
              <ImageUploader
                value={draft.language_background}
                onPick={(f) => onImage(f, "language_background")}
                onClear={() => setDraft((d) => ({ ...d, language_background: null }))}
              />
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
                <div
                  className="overflow-hidden rounded-xl border border-border"
                  style={{
                    backgroundImage: draft.language_background
                      ? `url(${withCacheBust(draft.language_background, draft.updated_at)})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#ffffff",
                    aspectRatio: "9 / 16",
                    maxHeight: "520px",
                  }}
                />
              </div>
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="booking" className="mt-4">
          <Section title="Booking URL" desc="Used to generate the QR code.">
            <input
              value={draft.booking_url ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, booking_url: e.target.value }))}
              placeholder={typeof window !== "undefined" ? window.location.origin : ""}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
            />
          </Section>
        </TabsContent>

        <TabsContent value="texts" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ImageUploader({
  value,
  onPick,
  onClear,
}: {
  value: string | null;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm hover:bg-accent">
        <Upload className="h-4 w-4" />
        Upload from PC
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
        />
      </label>
      {value && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
        >
          <Trash2 className="h-3 w-3" /> Remove image
        </button>
      )}
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
  { key: "firstNameLabel", label: "First Name Label" },
  { key: "lastNameLabel", label: "Last Name Label" },
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
  firstNameLabel,
  lastNameLabel,
  mobileLabel,
  submitLabel,
  phone,
}: {
  bg: string | null;
  title: string;
  subtitle: string;
  firstNameLabel: string;
  lastNameLabel: string;
  mobileLabel: string;
  submitLabel: string;
  phone: string | null;
}) {
  const image = bg;
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border"
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-1 text-[10px] font-medium text-foreground">{firstNameLabel}</div>
                  <div className="h-7 rounded-md border border-input bg-background" />
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-medium text-foreground">{lastNameLabel}</div>
                  <div className="h-7 rounded-md border border-input bg-background" />
                </div>
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
