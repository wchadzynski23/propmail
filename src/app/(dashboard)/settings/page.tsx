"use client";

import { useEffect, useState } from "react";
import { Settings, Key, Mail, User, Save, CheckCircle2, AlertCircle, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [resendApiKey, setResendApiKey] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setResendApiKey(data.resendApiKey || "");
        setSenderEmail(data.senderEmail || "");
        setSenderName(data.senderName || "");
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resendApiKey, senderEmail, senderName }),
    });

    setSaving(false);
    if (!res.ok) { setError("Failed to save settings."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="relative p-8 max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-1">
          Configuration
        </p>
        <h1 className="text-2xl font-bold text-foreground text-engraved">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure your Resend account and sender identity
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-status-green/10 border border-status-green/30 rounded-md px-3 py-2.5 mb-6">
          <CheckCircle2 className="h-4 w-4 text-status-green flex-shrink-0" />
          <p className="text-sm text-foreground">Settings saved successfully.</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2.5 mb-6">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Resend config */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center">
            <Key className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Resend API
            </p>
            <p className="text-xs text-muted-foreground/60">
              Get your API key at{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:brightness-110 inline-flex items-center gap-0.5"
              >
                resend.com/api-keys
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apikey">Resend API Key</Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="apikey"
              type={showKey ? "text" : "password"}
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="pl-9 pr-9 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sender identity */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Sender Identity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sendername">Sender Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="sendername"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Jane Smith · Real Estate"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senderemail">Sender Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="senderemail"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="jane@youragency.com"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-md bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Important:</span> The sender email must be a verified domain in Resend.
            During development you can use <code className="font-mono text-primary">onboarding@resend.dev</code>.
          </p>
        </div>
      </div>

      <Button variant="console" size="lg" onClick={save} disabled={saving || loading}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
