"use client";

import { useEffect, useState } from "react";
import {
  Key, Mail, User, Save, CheckCircle2, AlertCircle,
  ExternalLink, Eye, EyeOff, MapPin, Phone, Globe, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  // Resend
  const [resendApiKey, setResendApiKey]   = useState("");
  const [senderEmail, setSenderEmail]     = useState("");
  const [senderName, setSenderName]       = useState("");
  const [showKey, setShowKey]             = useState(false);
  // Footer / signature
  const [footerAgentName, setFooterAgentName]   = useState("");
  const [footerTitle, setFooterTitle]           = useState("");
  const [footerPhone, setFooterPhone]           = useState("");
  const [footerAddress, setFooterAddress]       = useState("");
  const [footerWebsite, setFooterWebsite]       = useState("");
  const [footerCustomText, setFooterCustomText] = useState("");

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setResendApiKey(d.resendApiKey || "");
      setSenderEmail(d.senderEmail || "");
      setSenderName(d.senderName || "");
      setFooterAgentName(d.footerAgentName || "");
      setFooterTitle(d.footerTitle || "");
      setFooterPhone(d.footerPhone || "");
      setFooterAddress(d.footerAddress || "");
      setFooterWebsite(d.footerWebsite || "");
      setFooterCustomText(d.footerCustomText || "");
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resendApiKey, senderEmail, senderName,
        footerAgentName, footerTitle, footerPhone,
        footerAddress, footerWebsite, footerCustomText,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save settings."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="relative p-8 max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-1">Configuration</p>
        <h1 className="text-2xl font-bold text-foreground text-engraved">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resend API, sender identity, and agent email footer</p>
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

      {/* Resend API */}
      <Section title="Resend API">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center">
            <Key className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground/60">
            Get your key at{" "}
            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:brightness-110 inline-flex items-center gap-0.5">
              resend.com/api-keys <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apikey">API Key</Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input id="apikey" type={showKey ? "text" : "password"} value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="pl-9 pr-9 font-mono text-sm" />
            <button type="button" onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </Section>

      {/* Sender Identity */}
      <Section title="Sender Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sendername">From Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input id="sendername" value={senderName} onChange={(e) => setSenderName(e.target.value)}
                placeholder="Jane Smith · Luxury Realty" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senderemail">From Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input id="senderemail" type="email" value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="jane@youragency.com" className="pl-9" />
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-md bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Tip:</span>{" "}
            Sender email must be a{" "}
            <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:brightness-110">verified domain in Resend</a>.
            Use <code className="font-mono text-primary">onboarding@resend.dev</code> for testing.
          </p>
        </div>
      </Section>

      {/* Agent Signature / Footer */}
      <Section title="Email Footer & Agent Signature">
        <p className="text-xs text-muted-foreground mb-4">
          Appended to every email you send. Physical address is <span className="text-primary font-medium">required by CAN-SPAM law</span>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <Label>Agent Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={footerAgentName} onChange={(e) => setFooterAgentName(e.target.value)}
                placeholder="Jane Smith" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Title / License</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={footerTitle} onChange={(e) => setFooterTitle(e.target.value)}
                placeholder="Licensed Real Estate Agent · Lic #12345" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={footerPhone} onChange={(e) => setFooterPhone(e.target.value)}
                placeholder="+1 (555) 000-0000" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={footerWebsite} onChange={(e) => setFooterWebsite(e.target.value)}
                placeholder="https://janesmith.realty" className="pl-9" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5 mb-4">
          <Label className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary" />
            Physical Mailing Address
            <span className="text-primary">*</span>
          </Label>
          <Input value={footerAddress} onChange={(e) => setFooterAddress(e.target.value)}
            placeholder="123 Main Street, Suite 100, New York, NY 10001, USA" />
          <p className="text-[11px] text-muted-foreground">Required by CAN-SPAM Act. Will appear in every email.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Custom Closing Message (optional)</Label>
          <Textarea value={footerCustomText} onChange={(e) => setFooterCustomText(e.target.value)}
            placeholder="Thank you for trusting me with your real estate journey. I look forward to helping you find your perfect home."
            rows={3} />
        </div>

        {/* Footer preview */}
        {(footerAgentName || footerAddress) && (
          <div className="mt-4 p-4 rounded-lg border border-border bg-secondary/30">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-2">Footer Preview</p>
            <div style={{ fontFamily: "sans-serif" }}>
              {footerCustomText && <p className="text-xs text-muted-foreground mb-2 italic">{footerCustomText}</p>}
              <p className="text-sm font-semibold text-foreground">{footerAgentName}</p>
              {footerTitle && <p className="text-xs text-muted-foreground">{footerTitle}</p>}
              <div className="flex flex-wrap gap-3 mt-1">
                {footerPhone && <span className="text-xs text-primary">{footerPhone}</span>}
                {footerWebsite && <span className="text-xs text-primary">{footerWebsite}</span>}
              </div>
              {footerAddress && <p className="text-[11px] text-muted-foreground/60 mt-1">{footerAddress}</p>}
            </div>
          </div>
        )}
      </Section>

      <Button variant="console" size="lg" onClick={save} disabled={saving || loading}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  );
}
