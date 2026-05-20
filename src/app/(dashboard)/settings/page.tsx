"use client";

import { useEffect, useState } from "react";
import {
  Key, Mail, User, Save, CheckCircle2, AlertCircle,
  ExternalLink, Eye, EyeOff, MapPin, Phone, Globe, FileText,
  Server, Lock, ChevronDown, Reply, Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── SMTP provider presets ─────────────────────────────────────────────────────
type ProviderKey = "resend" | "gmail" | "outlook" | "yahoo" | "custom";

interface SmtpPreset {
  label: string;
  logo: string;          // emoji fallback
  host: string;
  port: number;
  secure: boolean;       // true = TLS/465, false = STARTTLS/587
  userLabel: string;
  userPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  helpUrl: string;
  helpText: string;
}

const PRESETS: Record<ProviderKey, SmtpPreset> = {
  resend: {
    label: "Resend",
    logo: "✉️",
    host: "",
    port: 0,
    secure: false,
    userLabel: "API Key",
    userPlaceholder: "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    passwordLabel: "",
    passwordPlaceholder: "",
    helpUrl: "https://resend.com/api-keys",
    helpText: "Get your free API key at resend.com",
  },
  gmail: {
    label: "Gmail",
    logo: "🔴",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    userLabel: "Gmail Address",
    userPlaceholder: "you@gmail.com",
    passwordLabel: "App Password",
    passwordPlaceholder: "xxxx xxxx xxxx xxxx",
    helpUrl: "https://support.google.com/accounts/answer/185833",
    helpText: "Use an App Password — not your regular password. Requires 2-Step Verification.",
  },
  outlook: {
    label: "Outlook / Hotmail",
    logo: "🔵",
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    userLabel: "Outlook Address",
    userPlaceholder: "you@outlook.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your Outlook password",
    helpUrl: "https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353",
    helpText: "Use your regular Outlook password. Make sure SMTP AUTH is enabled in account settings.",
  },
  yahoo: {
    label: "Yahoo Mail",
    logo: "🟣",
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    userLabel: "Yahoo Address",
    userPlaceholder: "you@yahoo.com",
    passwordLabel: "App Password",
    passwordPlaceholder: "xxxx xxxx xxxx xxxx",
    helpUrl: "https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html",
    helpText: "Use an App Password — not your regular password. Generate one in Yahoo Account Security.",
  },
  custom: {
    label: "Custom SMTP",
    logo: "⚙️",
    host: "",
    port: 587,
    secure: false,
    userLabel: "Username / Email",
    userPlaceholder: "you@yourdomain.com",
    passwordLabel: "Password",
    passwordPlaceholder: "SMTP password",
    helpUrl: "https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol",
    helpText: "Enter the SMTP server details provided by your email provider.",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">{title}</p>
      {children}
    </div>
  );
}

function ProviderCard({
  providerKey, label, logo, selected, onClick,
}: {
  providerKey: ProviderKey;
  label: string;
  logo: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all cursor-pointer",
        selected
          ? "border-primary bg-primary/10 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:bg-secondary/60"
      )}
    >
      <span className="text-xl leading-none">{logo}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider leading-tight">{label}</span>
      {selected && <div className="h-1 w-1 rounded-full bg-primary" />}
    </button>
  );
}

export default function SettingsPage() {
  // Sender identity
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName]   = useState("");

  // Provider
  const [provider, setProvider] = useState<ProviderKey>("resend");

  // Resend
  const [resendApiKey, setResendApiKey] = useState("");
  const [showKey, setShowKey]           = useState(false);

  // SMTP
  const [smtpHost, setSmtpHost]         = useState("");
  const [smtpPort, setSmtpPort]         = useState(587);
  const [smtpSecure, setSmtpSecure]     = useState(false);
  const [smtpUser, setSmtpUser]         = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // Footer
  const [footerAgentName, setFooterAgentName]   = useState("");
  const [footerTitle, setFooterTitle]           = useState("");
  const [footerPhone, setFooterPhone]           = useState("");
  const [footerAddress, setFooterAddress]       = useState("");
  const [footerWebsite, setFooterWebsite]       = useState("");
  const [footerCustomText, setFooterCustomText] = useState("");

  // Reply & CRM
  const [replyTo,    setReplyTo]    = useState("");
  const [hubspotBcc, setHubspotBcc] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setSenderEmail(d.senderEmail || "");
      setSenderName(d.senderName  || "");
      setResendApiKey(d.resendApiKey || "");
      setProvider((d.smtpProvider as ProviderKey) || "resend");
      setSmtpHost(d.smtpHost     || "");
      setSmtpPort(d.smtpPort     || 587);
      setSmtpSecure(d.smtpSecure ?? false);
      setSmtpUser(d.smtpUser     || "");
      setSmtpPassword(d.smtpPassword || "");
      setReplyTo(d.replyTo       || "");
      setHubspotBcc(d.hubspotBcc || "");
      setFooterAgentName(d.footerAgentName   || "");
      setFooterTitle(d.footerTitle           || "");
      setFooterPhone(d.footerPhone           || "");
      setFooterAddress(d.footerAddress       || "");
      setFooterWebsite(d.footerWebsite       || "");
      setFooterCustomText(d.footerCustomText || "");
      setLoading(false);
    });
  }, []);

  function applyPreset(key: ProviderKey) {
    setProvider(key);
    const p = PRESETS[key];
    if (key !== "resend") {
      setSmtpHost(p.host);
      setSmtpPort(p.port);
      setSmtpSecure(p.secure);
      // keep user/password fields so user doesn't lose what they typed
    }
  }

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderEmail, senderName,
        resendApiKey,
        footerAgentName, footerTitle, footerPhone,
        footerAddress, footerWebsite, footerCustomText,
        smtpProvider: provider,
        smtpHost:     provider !== "resend" ? smtpHost  : null,
        smtpPort:     provider !== "resend" ? smtpPort  : null,
        smtpSecure:   provider !== "resend" ? smtpSecure : null,
        smtpUser:     provider !== "resend" ? smtpUser  : null,
        smtpPassword: provider !== "resend" ? smtpPassword : null,
        replyTo:    replyTo    || null,
        hubspotBcc: hubspotBcc || null,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save settings."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const preset = PRESETS[provider];

  return (
    <div className="relative p-8 max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-1">Configuration</p>
        <h1 className="text-2xl font-bold text-foreground text-engraved">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Sending account, sender identity, and agent email footer</p>
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

      {/* ── Email Sending Account ─────────────────────────────────────── */}
      <Section title="Email Sending Account">
        {/* Provider selector */}
        <p className="text-xs text-muted-foreground mb-3">Choose how PropMail sends emails on your behalf.</p>
        <div className="grid grid-cols-5 gap-2 mb-5">
          {(Object.keys(PRESETS) as ProviderKey[]).map((key) => (
            <ProviderCard
              key={key}
              providerKey={key}
              label={PRESETS[key].label}
              logo={PRESETS[key].logo}
              selected={provider === key}
              onClick={() => applyPreset(key)}
            />
          ))}
        </div>

        {/* ── Resend ── */}
        {provider === "resend" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
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
          </div>
        )}

        {/* ── SMTP providers ── */}
        {provider !== "resend" && (
          <div className="space-y-4">
            {/* Help text */}
            <div className="flex items-start gap-2 rounded-md bg-secondary/50 border border-border p-3">
              <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {preset.helpText}{" "}
                <a href={preset.helpUrl} target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:brightness-110 inline-flex items-center gap-0.5">
                  Learn more <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>

            {/* Server settings (editable for Custom, read-only display for presets) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>SMTP Host</Label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.example.com"
                    readOnly={provider !== "custom"}
                    className={cn("pl-9 font-mono text-sm", provider !== "custom" && "opacity-60 cursor-default")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Port</Label>
                <Input value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))}
                  type="number"
                  readOnly={provider !== "custom"}
                  className={cn("font-mono text-sm", provider !== "custom" && "opacity-60 cursor-default")} />
              </div>
            </div>

            {provider === "custom" && (
              <div className="space-y-1.5">
                <Label>Connection Security</Label>
                <div className="flex gap-2">
                  {[
                    { value: false, label: "STARTTLS (587)" },
                    { value: true,  label: "TLS (465)" },
                  ].map(({ value, label }) => (
                    <button key={label} type="button"
                      onClick={() => setSmtpSecure(value)}
                      className={cn(
                        "flex-1 rounded-md border py-2 text-xs font-mono transition-all",
                        smtpSecure === value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            <div className="space-y-1.5">
              <Label>{preset.userLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder={preset.userPlaceholder} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{preset.passwordLabel}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)}
                  type={showSmtpPass ? "text" : "password"}
                  placeholder={preset.passwordPlaceholder}
                  className="pl-9 pr-9 font-mono text-sm" />
                <button type="button" onClick={() => setShowSmtpPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSmtpPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Sender Identity ──────────────────────────────────────────────── */}
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
        {provider === "resend" && (
          <div className="mt-3 p-3 rounded-md bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span>{" "}
              Sender email must be a{" "}
              <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer"
                className="text-primary hover:brightness-110">verified domain in Resend</a>.
              Use <code className="font-mono text-primary">onboarding@resend.dev</code> for testing.
            </p>
          </div>
        )}
        {provider !== "resend" && (
          <div className="mt-3 p-3 rounded-md bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span>{" "}
              Leave blank to use your {preset.label} address as the sender.
            </p>
          </div>
        )}
      </Section>

      {/* ── Reply-To & HubSpot CRM ──────────────────────────────────────── */}
      <Section title="Replies & CRM Integration">
        {/* Reply-To */}
        <div className="space-y-1.5 mb-5">
          <Label className="flex items-center gap-1.5">
            <Reply className="h-3.5 w-3.5 text-primary" />
            Reply-To Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              type="email"
              placeholder="jane@gmail.com"
              className="pl-9"
            />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            When a client hits <span className="font-medium text-foreground">Reply</span> on your email, their message goes here — not to your sending domain.
            Use your real inbox (Gmail, Outlook, etc.).
          </p>
        </div>

        {/* HubSpot BCC */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Webhook className="h-3.5 w-3.5 text-primary" />
            HubSpot BCC Log Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={hubspotBcc}
              onChange={(e) => setHubspotBcc(e.target.value)}
              placeholder="log-XXXXXXXX@hs-inbox.com"
              className="pl-9 font-mono text-sm"
            />
          </div>
          <div className="p-3 rounded-md bg-secondary/50 border border-border space-y-1.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every email PropMail sends will be BCCed to this address.
              HubSpot automatically logs it on the contact&apos;s timeline.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Where to find it:</span>{" "}
              HubSpot → Settings → General → Email →{" "}
              <a
                href="https://knowledge.hubspot.com/contacts/log-email-in-crm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:brightness-110 inline-flex items-center gap-0.5"
              >
                Log email in CRM <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>
        </div>

        {/* Live preview of the flow */}
        {(replyTo || hubspotBcc) && (
          <div className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-4 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">Email flow preview</p>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-primary mt-0.5">→</span>
              <span>PropMail sends via <span className="text-foreground font-medium">Resend</span></span>
            </div>
            {replyTo && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="font-mono text-primary mt-0.5">→</span>
                <span>Client replies land in <span className="text-foreground font-medium">{replyTo}</span></span>
              </div>
            )}
            {hubspotBcc && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="font-mono text-primary mt-0.5">→</span>
                <span>Every send logged to HubSpot via <span className="text-foreground font-medium">{hubspotBcc}</span></span>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── Agent Signature / Footer ─────────────────────────────────────── */}
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

        {(footerAgentName || footerAddress) && (
          <div className="mt-4 p-4 rounded-lg border border-border bg-secondary/30">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-2">Footer Preview</p>
            <div style={{ fontFamily: "sans-serif" }}>
              {footerCustomText && <p className="text-xs text-muted-foreground mb-2 italic">{footerCustomText}</p>}
              <p className="text-sm font-semibold text-foreground">{footerAgentName}</p>
              {footerTitle && <p className="text-xs text-muted-foreground">{footerTitle}</p>}
              <div className="flex flex-wrap gap-3 mt-1">
                {footerPhone   && <span className="text-xs text-primary">{footerPhone}</span>}
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
