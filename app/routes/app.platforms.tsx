import { useState, useEffect, useCallback } from "react";
import { Card, Button, Input, Modal, PageHeader, Badge, Spinner } from "~/components/ui";
import { Share2, CheckCircle2, Link2Off, ExternalLink } from "lucide-react";

interface Platform {
  _id: string;
  platformName: string;
  isConnected: boolean;
  accountUsername?: string;
  connectedAt?: string;
}

const PLATFORM_META: Record<
  string,
  { color: string; textColor: string; emoji: string; hint: string }
> = {
  Instagram: { color: "#E1306C", textColor: "#fff", emoji: "📸", hint: "@yourhandle" },
  Facebook: { color: "#1877F2", textColor: "#fff", emoji: "👍", hint: "Page or profile name" },
  "Twitter/X": { color: "#000000", textColor: "#fff", emoji: "𝕏", hint: "@yourhandle" },
  TikTok: { color: "#010101", textColor: "#fff", emoji: "🎵", hint: "@yourhandle" },
  Pinterest: { color: "#E60023", textColor: "#fff", emoji: "📌", hint: "Pinterest username" },
  LinkedIn: { color: "#0A66C2", textColor: "#fff", emoji: "💼", hint: "Company or profile name" },
};

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectModal, setConnectModal] = useState<Platform | null>(null);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const fetchPlatforms = useCallback(async () => {
    try {
      const res = await fetch("/api/postpilot/platforms");
      const data = await res.json();
      setPlatforms(data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch platforms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  function openConnect(platform: Platform) {
    setConnectModal(platform);
    setUsername("");
    setUsernameError("");
  }

  async function handleConnect() {
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }
    if (!connectModal) return;
    setSaving(true);
    try {
      const name = encodeURIComponent(connectModal.platformName);
      const res = await fetch(`/api/postpilot/platforms/${name}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        setConnectModal(null);
        await fetchPlatforms();
      }
    } catch (err) {
      console.error("Connect failed:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(platform: Platform) {
    if (!confirm(`Disconnect ${platform.platformName}? Your posts there will stop.`)) return;
    setDisconnecting(platform.platformName);
    try {
      const name = encodeURIComponent(platform.platformName);
      await fetch(`/api/postpilot/platforms/${name}/disconnect`, { method: "POST" });
      await fetchPlatforms();
    } catch (err) {
      console.error("Disconnect failed:", err);
    } finally {
      setDisconnecting(null);
    }
  }

  const connected = platforms.filter((p) => p.isConnected);
  const disconnected = platforms.filter((p) => !p.isConnected);

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
        title="Platform Connections"
        description={`${connected.length} of ${platforms.length} platforms connected. Posts go to all connected platforms daily.`}
      />

      {/* Connected platforms */}
      {connected.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Connected
          </h2>
          <div className="space-y-3">
            {connected.map((platform) => {
              const meta = PLATFORM_META[platform.platformName] ?? {
                color: "#6B7280",
                textColor: "#fff",
                emoji: "🔗",
                hint: "username",
              };
              return (
                <Card key={platform._id} className="p-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: meta.color, color: meta.textColor }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        {platform.platformName}
                      </span>
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    {platform.accountUsername && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {platform.accountUsername}
                      </p>
                    )}
                    {platform.connectedAt && (
                      <p className="text-xs text-muted-foreground">
                        Since {new Date(platform.connectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDisconnect(platform)}
                    loading={disconnecting === platform.platformName}
                  >
                    <Link2Off className="w-4 h-4" />
                    Disconnect
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Available to connect */}
      {disconnected.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Available to Connect
          </h2>
          <div className="space-y-3">
            {disconnected.map((platform) => {
              const meta = PLATFORM_META[platform.platformName] ?? {
                color: "#6B7280",
                textColor: "#fff",
                emoji: "🔗",
                hint: "username",
              };
              return (
                <Card key={platform._id} className="p-4 flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 grayscale"
                    style={{ backgroundColor: meta.color, color: meta.textColor }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground text-sm">
                      {platform.platformName}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openConnect(platform)}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Connect
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Connect modal */}
      <Modal
        isOpen={!!connectModal}
        onClose={() => setConnectModal(null)}
        title={`Connect ${connectModal?.platformName}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConnectModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} loading={saving}>
              Connect
            </Button>
          </>
        }
      >
        {connectModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{
                  backgroundColor: PLATFORM_META[connectModal.platformName]?.color ?? "#6B7280",
                  color: "#fff",
                }}
              >
                {PLATFORM_META[connectModal.platformName]?.emoji ?? "🔗"}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{connectModal.platformName}</p>
                <p className="text-xs text-muted-foreground">Mock OAuth — enter your account name</p>
              </div>
            </div>
            <Input
              label="Account Username / Handle"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={usernameError}
              placeholder={PLATFORM_META[connectModal.platformName]?.hint ?? "username"}
              hint="This simulates connecting via OAuth. In production, real OAuth tokens would be used."
            />
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <Share2 className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Once connected, every daily scheduled post will be sent to this platform automatically.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
