import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { Card, Badge, Button, Spinner, PageHeader } from "~/components/ui";
import {
  Package,
  Share2,
  Clock,
  History,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Calendar,
} from "lucide-react";

interface DashboardData {
  products: { total: number };
  platforms: { total: number; connected: number };
  schedule: { postingTime: string; isEnabled: boolean; lastRunAt?: string };
  history: { total: number; successful: number; failed: number; partial: number };
  nextProduct: {
    _id: string;
    name: string;
    imageUrl?: string;
    description?: string;
    price: string;
    purchaseLink?: string;
  } | null;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  to: string;
}) {
  return (
    <Link to={to} className="block group">
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
            {icon}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-sm font-medium text-foreground mt-0.5">{label}</div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
        </div>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { config, loading: configLoading } = useConfigurables();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const appName = configLoading ? "PostPilot" : (config?.appName ?? "PostPilot");
  const tagline = config?.tagline ?? "Automate your product promotions";
  const captionTemplate =
    config?.postCaptionTemplate ??
    "Check out {name}! {description} — Only {price}. Shop now: {link}";

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, platformsRes, scheduleRes, historyStatsRes, nextProductRes] =
        await Promise.all([
          fetch("/api/postpilot/products"),
          fetch("/api/postpilot/platforms"),
          fetch("/api/postpilot/schedule"),
          fetch("/api/postpilot/history/stats"),
          fetch("/api/postpilot/schedule/next-product"),
        ]);

      const [products, platforms, schedule, historyStats, nextProduct] = await Promise.all([
        productsRes.json(),
        platformsRes.json(),
        scheduleRes.json(),
        historyStatsRes.json(),
        nextProductRes.json(),
      ]);

      const connectedCount = (platforms.data ?? []).filter((p: { isConnected: boolean }) => p.isConnected).length;

      setData({
        products: { total: (products.data ?? []).length },
        platforms: { total: (platforms.data ?? []).length, connected: connectedCount },
        schedule: {
          postingTime: schedule.data?.postingTime ?? "09:00",
          isEnabled: schedule.data?.isEnabled ?? false,
          lastRunAt: schedule.data?.lastRunAt,
        },
        history: historyStats.data ?? { total: 0, successful: 0, failed: 0, partial: 0 },
        nextProduct: nextProduct.data ?? null,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleManualPost = async () => {
    setPosting(true);
    setPostResult(null);
    try {
      const res = await fetch("/api/postpilot/schedule/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captionTemplate }),
      });
      const result = await res.json();
      if (result.data?.skipped) {
        setPostResult({ success: false, message: result.data.reason === "no_products" ? "No active products to post." : "No connected platforms." });
      } else {
        setPostResult({ success: true, message: "Post sent successfully!" });
        await fetchData();
      }
    } catch {
      setPostResult({ success: false, message: "Failed to send post." });
    } finally {
      setPosting(false);
    }
  };

  function buildCaption(product: DashboardData["nextProduct"]): string {
    if (!product) return "";
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

  const onboardingComplete =
    (data?.products.total ?? 0) > 0 &&
    (data?.platforms.connected ?? 0) > 0 &&
    data?.schedule.isEnabled;

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <PageHeader
        title={`Welcome to ${appName}`}
        description={tagline}
        action={
          <Button onClick={handleManualPost} loading={posting} size="sm">
            <Zap className="w-4 h-4" />
            Post Now
          </Button>
        }
      />

      {postResult && (
        <div
          className={`flex items-center gap-2 mb-6 px-4 py-3 rounded-lg text-sm ${
            postResult.success
              ? "bg-accent/10 text-accent border border-accent/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {postResult.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {postResult.message}
        </div>
      )}

      {/* Onboarding checklist */}
      {!onboardingComplete && (
        <Card className="mb-6 p-5 border-l-4 border-l-primary">
          <h2 className="font-semibold text-foreground mb-3" style={{ fontFamily: "var(--heading-font)" }}>
            Get Started — 3 steps to automate your posts
          </h2>
          <div className="space-y-2">
            {[
              {
                done: (data?.platforms.connected ?? 0) > 0,
                label: "Connect at least one social platform",
                to: "/app/platforms",
              },
              {
                done: (data?.products.total ?? 0) > 0,
                label: "Add at least one product",
                to: "/app/products",
              },
              {
                done: data?.schedule.isEnabled ?? false,
                label: "Set a daily posting time and enable scheduling",
                to: "/app/schedule",
              },
            ].map((step) => (
              <Link
                key={step.to}
                to={step.to}
                className="flex items-center gap-3 py-1.5 group"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    step.done
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border group-hover:border-primary"
                  }`}
                >
                  {step.done && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span
                  className={`text-sm ${
                    step.done
                      ? "line-through text-muted-foreground"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Products"
          value={data?.products.total ?? 0}
          sub="in catalog"
          to="/app/products"
        />
        <StatCard
          icon={<Share2 className="w-5 h-5" />}
          label="Platforms"
          value={`${data?.platforms.connected ?? 0} / ${data?.platforms.total ?? 6}`}
          sub="connected"
          to="/app/platforms"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Daily Time"
          value={data?.schedule.postingTime ?? "—"}
          sub={data?.schedule.isEnabled ? "enabled" : "disabled"}
          to="/app/schedule"
        />
        <StatCard
          icon={<History className="w-5 h-5" />}
          label="Posts Sent"
          value={data?.history.total ?? 0}
          sub={`${data?.history.successful ?? 0} successful`}
          to="/app/history"
        />
      </div>

      {/* Next post preview + last run */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Next post preview */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: "var(--heading-font)" }}>
            <Calendar className="w-4 h-4 text-primary" />
            Next Scheduled Post
          </h3>
          {data?.nextProduct ? (
            <div className="border border-border rounded-xl overflow-hidden border-l-4 border-l-primary">
              {data.nextProduct.imageUrl && (
                <img
                  src={data.nextProduct.imageUrl}
                  alt={data.nextProduct.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary">{data.nextProduct.price}</Badge>
                  <span className="font-semibold text-foreground text-sm">{data.nextProduct.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {buildCaption(data.nextProduct)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Package className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Add products to see your next post preview</p>
              <Link to="/app/products" className="text-primary text-sm mt-2 hover:underline">
                Add a product
              </Link>
            </div>
          )}
        </Card>

        {/* Posting status */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: "var(--heading-font)" }}>
            <Zap className="w-4 h-4 text-primary" />
            Automation Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Auto-posting</span>
              <Badge variant={data?.schedule.isEnabled ? "success" : "neutral"}>
                {data?.schedule.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Posting time (UTC)</span>
              <span className="text-sm font-medium text-foreground">{data?.schedule.postingTime ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Connected platforms</span>
              <span className="text-sm font-medium text-foreground">
                {data?.platforms.connected ?? 0} of {data?.platforms.total ?? 6}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Last post run</span>
              <span className="text-sm font-medium text-foreground">
                {data?.schedule.lastRunAt
                  ? new Date(data.schedule.lastRunAt).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/app/schedule">
              <Button variant="outline" size="sm" className="w-full">
                Manage Schedule
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
