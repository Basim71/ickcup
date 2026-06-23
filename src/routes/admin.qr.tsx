import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Copy, Download, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/admin/qr")({
  component: QrPage,
});

function QrPage() {
  const { settings } = useSiteSettings();
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const defaultUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin + "/" : ""),
    [],
  );
  const url = settings.booking_url || defaultUrl;

  const regenerate = async (target: string) => {
    if (!target) return;
    const png = await QRCode.toDataURL(target, { width: 512, margin: 2, errorCorrectionLevel: "H" });
    setPngUrl(png);
    const svg = await QRCode.toString(target, { type: "svg", margin: 2, errorCorrectionLevel: "H" });
    setSvgMarkup(svg);
    if (canvasRef.current) {
      await QRCode.toCanvas(canvasRef.current, target, { width: 320, margin: 2 });
    }
  };

  useEffect(() => {
    regenerate(url);
  }, [url]);

  const persistBookingUrl = async (newUrl: string) => {
    const { data: existing } = await supabase.from("settings").select("id").limit(1).maybeSingle();
    if (existing?.id) {
      await supabase.from("settings").update({ booking_url: newUrl }).eq("id", existing.id);
    } else {
      await supabase.from("settings").insert({ booking_url: newUrl });
    }
    await logAudit("update_booking_url", "settings", { booking_url: newUrl });
  };

  const downloadPng = () => {
    if (!pngUrl) return;
    triggerDownload(pngUrl, "booking-qr.png");
  };
  const downloadSvg = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    triggerDownload(URL.createObjectURL(blob), "booking-qr.svg");
  };
  const downloadPdf = async () => {
    if (!pngUrl) return;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();
    const size = 360;
    pdf.setFontSize(18);
    pdf.text("Scan to book", w / 2, 100, { align: "center" });
    pdf.addImage(pngUrl, "PNG", (w - size) / 2, 140, size, size);
    pdf.setFontSize(11);
    pdf.text(url, w / 2, 140 + size + 30, { align: "center", maxWidth: w - 80 });
    pdf.save("booking-qr.pdf");
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">QR Code Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate and download a QR code that links visitors to your booking page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <label className="block text-sm font-medium">Booking URL</label>
            <p className="mt-1 text-xs text-muted-foreground">
              The QR code links to this URL. Update it if your booking site moves.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={settings.booking_url ?? ""}
                placeholder={defaultUrl}
                onChange={(e) => persistBookingUrl(e.target.value)}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={copyUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy URL"}
              </button>
              <button
                onClick={() => regenerate(url)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <RefreshCw className="h-4 w-4" /> Regenerate
              </button>
            </div>
            <p className="mt-3 break-all rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {url}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Download</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DownloadBtn label="PNG" onClick={downloadPng} />
              <DownloadBtn label="SVG" onClick={downloadSvg} />
              <DownloadBtn label="PDF" onClick={downloadPdf} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">Preview</h2>
          <div className="mt-4 rounded-2xl bg-white p-4">
            <canvas ref={canvasRef} />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Scan to test</p>
        </div>
      </div>
    </div>
  );
}

function DownloadBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)]"
    >
      <Download className="h-4 w-4" /> {label}
    </button>
  );
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
