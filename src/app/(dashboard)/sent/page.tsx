"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertCircle,
  XCircle, Users, FileText, Mail, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Recipient {
  email: string;
  name?: string;
  contactName: string | null;
  company: string | null;
  tags: string | null;
  unsubscribedAt: string | null;
}

interface SendRecord {
  id: string;
  sentAt: string;
  status: "sent" | "partial" | "failed" | "skipped";
  recipientCount: number;
  template: { id: string; name: string; subject: string };
  recipients: Recipient[];
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SendRecord["status"] }) {
  const map = {
    sent:    { label: "Sent",    cls: "bg-status-green/10 text-status-green border-status-green/20",   icon: CheckCircle2 },
    partial: { label: "Partial", cls: "bg-yellow-500/10   text-yellow-400  border-yellow-500/20",      icon: AlertCircle },
    failed:  { label: "Failed",  cls: "bg-destructive/10  text-destructive border-destructive/20",     icon: XCircle },
    skipped: { label: "Skipped", cls: "bg-muted/20        text-muted-foreground border-border",        icon: XCircle },
  } as const;
  const { label, cls, icon: Icon } = map[status] ?? map.sent;
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border", cls)}>
      <Icon className="h-2.5 w-2.5" />{label}
    </span>
  );
}

// ─── Recipient row ────────────────────────────────────────────────────────────
function RecipientRow({ r }: { r: Recipient }) {
  const displayName = r.contactName || r.name || null;
  const initial = (displayName || r.email).charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-3 py-2 px-4 hover:bg-secondary/20 transition-colors">
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/60 to-orange-700/60 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-foreground">{displayName || r.email}</p>
          {r.unsubscribedAt && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              Unsubscribed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Mail className="h-2.5 w-2.5" />{r.email}
          </span>
          {r.company && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Building2 className="h-2.5 w-2.5" />{r.company}
            </span>
          )}
        </div>
      </div>
      {r.tags && (
        <div className="flex flex-wrap gap-1 justify-end">
          {r.tags.split(",").filter(Boolean).slice(0, 2).map((t) => (
            <span key={t} className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Send row (expandable) ────────────────────────────────────────────────────
function SendRow({ record }: { record: SendRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      "border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 overflow-hidden transition-all",
      open && "border-primary/20"
    )}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left group hover:bg-secondary/20 transition-colors"
      >
        {/* Template icon */}
        <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Name + subject */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{record.template.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{record.template.subject}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            {record.recipientCount}
          </span>
          <span className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(record.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <StatusBadge status={record.status} />
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded recipients */}
      {open && (
        <div className="border-t border-border/50">
          <div className="flex items-center justify-between px-5 py-2 bg-secondary/20">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Recipients — {record.recipientCount}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono sm:hidden">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(record.sentAt).toLocaleDateString()}</span>
            </div>
            <Link href={`/templates/${record.template.id}`}
              className="text-[11px] text-primary hover:brightness-110 font-mono flex items-center gap-1">
              <FileText className="h-3 w-3" /> View Template
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {record.recipients.map((r) => (
              <RecipientRow key={r.email} r={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SentPage() {
  const [sends, setSends]   = useState<SendRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sent").then((r) => r.json()).then((d: SendRecord[]) => {
      setSends(d);
      setLoading(false);
    });
  }, []);

  const totalRecipients = sends.reduce((a, s) => a + s.recipientCount, 0);

  return (
    <div className="relative p-6 md:p-8">
      {/* Header */}
      <div className="mb-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-0.5">Activity Log</p>
        <h1 className="text-2xl font-bold text-foreground text-engraved">Sent Emails</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {sends.length} campaign{sends.length !== 1 ? "s" : ""} · {totalRecipients.toLocaleString()} recipient{totalRecipients !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 h-20 animate-pulse" />
          ))}
        </div>
      ) : sends.length === 0 ? (
        <div className="border-engraved rounded-xl bg-gradient-to-b from-secondary/40 to-secondary/10 p-16 text-center">
          <Send className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No emails sent yet</h3>
          <p className="text-sm text-muted-foreground">
            Send your first email from the{" "}
            <Link href="/send" className="text-primary hover:brightness-110">Send page</Link>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sends.map((s) => <SendRow key={s.id} record={s} />)}
        </div>
      )}
    </div>
  );
}
