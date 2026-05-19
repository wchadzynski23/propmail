"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FileText, Send, Users, TrendingUp, Plus, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Stats {
  templateCount: number;
  sendCount: number;
  recipientCount: number;
  recentSends: {
    id: string;
    sentAt: string;
    status: string;
    recipients: string;
    template: { name: string };
  }[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={cn("border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 relative overflow-hidden", accent && "border-primary/20")}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {label}
          </p>
          <p className={cn("text-3xl font-bold text-engraved", accent ? "text-primary" : "text-foreground")}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={cn("h-9 w-9 rounded-md flex items-center justify-center border", accent ? "bg-primary/10 border-primary/20" : "bg-secondary border-border")}>
          <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-muted-foreground")} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] || "Agent";

  return (
    <div className="relative p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-status-green led-green animate-pulse-glow" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Dashboard · Active
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground text-engraved">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your email templates and track campaigns
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Templates" value={stats?.templateCount ?? 0} icon={FileText} />
        <StatCard label="Emails Sent" value={stats?.sendCount ?? 0} icon={Send} accent />
        <StatCard label="Recipients Reached" value={stats?.recipientCount ?? 0} icon={Users} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Quick Actions
          </p>
          <div className="space-y-2">
            <Link href="/templates/new">
              <Button variant="console" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  New Template
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/send">
              <Button variant="metal" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  Send Email
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Recent Sends
            </p>
          </div>
          {!stats?.recentSends?.length ? (
            <div className="text-center py-6">
              <Send className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No emails sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentSends.map((s) => {
                const recipients = JSON.parse(s.recipients) as { email: string }[];
                return (
                  <div key={s.id} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
                    <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", s.status === "sent" ? "bg-status-green led-green" : "bg-destructive")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{s.template.name}</p>
                      <p className="text-[11px] text-muted-foreground">{recipients.length} recipient{recipients.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground/60">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono text-[10px]">
                        {new Date(s.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Getting started tip */}
      {!stats?.templateCount && (
        <div className="border border-primary/20 rounded-lg bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Create your first template</p>
              <p className="text-xs text-muted-foreground mb-3">
                Build a reusable email template with text, images, Vimeo videos, and call-to-action buttons.
              </p>
              <Link href="/templates/new">
                <Button variant="console" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Create Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
