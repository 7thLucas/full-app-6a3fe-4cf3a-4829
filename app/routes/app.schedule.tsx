import { useState, useEffect, useCallback } from "react";
import { useConfigurables } from "~/modules/configurables";
import { Card, Button, Input, PageHeader, Badge, Spinner, Toggle } from "~/components/ui";
import {
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Package,
  ChevronRight,
} from "lucide-react";

interface ScheduleData {
  postingTime: string;
  timezone: string;
  isEnabled: boolean;
  lastRunAt?: string;
  lastPostedProductId?: string;
}

interface NextProduct {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: string;
  purchaseLink?: string;
}

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function SchedulePage() {
  const { config } = useConfigurables();
  const captionTemplate =
    config?.postCaptionTemplate ??
    "Check out {name}! {description} — Only {price}. Shop now: {link}";

  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [nextProduct, setNextProduct] = useState<NextProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [runResult, setRunResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const [form, setForm] = useState({ postingTime: "09:00", timezone: "UTC", isEnabled: false });

  const fetchData = useCallback(async () => {
    try {
      const [scheduleRes, nextProductRes] = await Promise.all([
        fetch("/api/postpilot/schedule"),
        fetch("/api/postpilot/schedule/next-product"),
      ]);
      const [scheduleData, nextProductData] = await Promise.all([
        scheduleRes.json(),
        nextProductRes.json(),
      ]);
      const s = scheduleData.data;
      setSchedule(s);
      setForm({
        postingTime: s?.postingTime ?? "09:00",
        timezone: s?.timezone ?? "UTC",
        isEnabled: s?.isEnabled ?? false,
      });
      setNextProduct(nextProductData.data ?? null);
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave() {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/postpilot/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaveResult({ success: true, message: "Schedule saved successfully!" });
        await fetchData();
      } else {
        setSaveResult({ success: false, message: "Failed to save schedule." });
      }
    } catch {
      setSaveResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleRunNow() {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/postpilot/schedule/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captionTemplate }),
      });
      const data = await res.json();
      if (data.data?.skipped) {
        setRunResult({
          success: false,
          message:
            data.data.reason === "no_products"
              ? "No active products. Add products first."
              : "No connected platforms. Connect at least one platform first.",
        });
      } else {
        setRunResult({ success: true, message: "Post sent successfully to all connected platforms!" });
        await fetchData();
      }
    } catch {
      setRunResult({ success: false, message: "Failed to trigger posting job." });
    } finally {
      setRunning(false);
    }
  }

  function buildCaption(product: NextProduct): string {
    return captionTemplate
      .replace("{name}", product.name)
      .replace("{description}", product.description?.slice(0, 120) ?? "")
      .replace("{price}", product.price)
      .replace("{link}", product.purchaseLink ?? "");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <PageHeader
        title="Rotation Schedule"
        description="Set a daily time to auto-post to all your connected platforms. Products rotate in order."
      />

      <div className="space-y-6">
        {/* Schedule config card */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "var(--heading-font)" }}>
            <Clock className="w-4 h-4 text-primary" />
            Daily Posting Time
          </h2>

          <div className="space-y-4">
            <Toggle
              checked={form.isEnabled}
              onChange={(v) => setForm((f) => ({ ...f, isEnabled: v }))}
              label="Enable auto-posting"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Time (HH:MM)
                </label>
                <input
                  type="time"
                  value={form.postingTime}
                  onChange={(e) => setForm((f) => ({ ...f, postingTime: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Timezone</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg text-xs text-muted-foreground">
              <RotateCcw className="w-4 h-4 text-primary shrink-0" />
              <span>
                The scheduler fires at the set time (UTC-based check). Products rotate in the order
                they appear in your catalog — one product per day.
              </span>
            </div>

            {saveResult && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                  saveResult.success
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {saveResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {saveResult.message}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} loading={saving}>
                Save Schedule
              </Button>
              <Button variant="secondary" onClick={handleRunNow} loading={running}>
                <Zap className="w-4 h-4" />
                Post Now (Manual)
              </Button>
            </div>
          </div>
        </Card>

        {runResult && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              runResult.success
                ? "bg-accent/10 text-accent border border-accent/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {runResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {runResult.message}
          </div>
        )}

        {/* Status overview */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4" style={{ fontFamily: "var(--heading-font)" }}>
            Current Status
          </h2>
          <div className="divide-y divide-border">
            {[
              {
                label: "Auto-posting",
                value: (
                  <Badge variant={form.isEnabled ? "success" : "neutral"}>
                    {form.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                ),
              },
              { label: "Posting time", value: form.postingTime + " (UTC)" },
              { label: "Timezone", value: form.timezone },
              {
                label: "Last run",
                value: schedule?.lastRunAt
                  ? new Date(schedule.lastRunAt).toLocaleString()
                  : "Never",
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Next post preview */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "var(--heading-font)" }}>
            <Package className="w-4 h-4 text-primary" />
            Next Post Preview
          </h2>
          {nextProduct ? (
            <div className="border border-border rounded-xl overflow-hidden border-l-4 border-l-primary">
              {nextProduct.imageUrl && (
                <img
                  src={nextProduct.imageUrl}
                  alt={nextProduct.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary">{nextProduct.price}</Badge>
                  <span className="font-semibold text-foreground">{nextProduct.name}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {buildCaption(nextProduct)}
                </p>
                {nextProduct.purchaseLink && (
                  <a
                    href={nextProduct.purchaseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {nextProduct.purchaseLink}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Package className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Add products to your catalog to see your next post preview.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
