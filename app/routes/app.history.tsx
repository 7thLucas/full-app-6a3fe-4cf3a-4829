import { useState, useEffect, useCallback } from "react";
import { Card, PageHeader, Badge, Spinner, EmptyState } from "~/components/ui";
import { History, CheckCircle2, XCircle, AlertCircle, Package } from "lucide-react";

interface PlatformResult {
  platform: string;
  status: "success" | "failed";
  error?: string;
}

interface PostHistoryEntry {
  _id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  caption?: string;
  platformResults: PlatformResult[];
  overallStatus: "success" | "failed" | "partial";
  postedAt: string;
}

interface Stats {
  total: number;
  successful: number;
  failed: number;
  partial: number;
}

const PLATFORM_EMOJI: Record<string, string> = {
  Instagram: "📸",
  Facebook: "👍",
  "Twitter/X": "𝕏",
  TikTok: "🎵",
  Pinterest: "📌",
  LinkedIn: "💼",
};

function StatusIcon({ status }: { status: "success" | "failed" | "partial" }) {
  if (status === "success") return <CheckCircle2 className="w-4 h-4 text-accent" />;
  if (status === "failed") return <XCircle className="w-4 h-4 text-destructive" />;
  return <AlertCircle className="w-4 h-4 text-yellow-500" />;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<PostHistoryEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [entriesRes, statsRes] = await Promise.all([
        fetch("/api/postpilot/history?limit=50"),
        fetch("/api/postpilot/history/stats"),
      ]);
      const [entriesData, statsData] = await Promise.all([
        entriesRes.json(),
        statsRes.json(),
      ]);
      setEntries(entriesData.data ?? []);
      setStats(statsData.data ?? null);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <PageHeader
        title="Posting History"
        description="A complete log of every post sent by PostPilot."
      />

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Posts", value: stats.total, color: "text-foreground" },
            { label: "Successful", value: stats.successful, color: "text-accent" },
            { label: "Partial", value: stats.partial, color: "text-yellow-500" },
            { label: "Failed", value: stats.failed, color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label} className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* History list */}
      {entries.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No posts yet"
          description="Once PostPilot sends its first post, it will show up here with full details."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry._id} className="overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(expanded === entry._id ? null : entry._id)}
              >
                {/* Product image / icon */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                  {entry.productImageUrl ? (
                    <img
                      src={entry.productImageUrl}
                      alt={entry.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm truncate">
                      {entry.productName}
                    </span>
                    <Badge
                      variant={
                        entry.overallStatus === "success"
                          ? "success"
                          : entry.overallStatus === "failed"
                          ? "error"
                          : "warning"
                      }
                    >
                      {entry.overallStatus === "success"
                        ? "All good"
                        : entry.overallStatus === "failed"
                        ? "Failed"
                        : "Partial"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.postedAt).toLocaleString()}
                    </span>
                    {/* Platform icons */}
                    <span className="flex gap-1 text-xs">
                      {entry.platformResults.map((r) => (
                        <span
                          key={r.platform}
                          title={`${r.platform}: ${r.status}`}
                          className={r.status === "failed" ? "opacity-40" : ""}
                        >
                          {PLATFORM_EMOJI[r.platform] ?? "🔗"}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                <StatusIcon status={entry.overallStatus} />
              </button>

              {/* Expanded row */}
              {expanded === entry._id && (
                <div className="border-t border-border p-4 bg-muted/20">
                  {/* Caption */}
                  {entry.caption && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Caption
                      </p>
                      <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3 leading-relaxed">
                        {entry.caption}
                      </p>
                    </div>
                  )}

                  {/* Platform results */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Platform Results
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {entry.platformResults.map((r) => (
                      <div
                        key={r.platform}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-sm border ${
                          r.status === "success"
                            ? "border-accent/20 bg-accent/5"
                            : "border-destructive/20 bg-destructive/5"
                        }`}
                      >
                        <span>{PLATFORM_EMOJI[r.platform] ?? "🔗"}</span>
                        <span className="font-medium text-foreground text-xs">{r.platform}</span>
                        {r.status === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent ml-auto" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-destructive ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
