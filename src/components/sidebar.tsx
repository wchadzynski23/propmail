"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Send,
  Settings,
  LogOut,
  Mail,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/send", label: "Send Email", icon: Send },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col bg-brushed-metal">
      {/* Logo */}
      <div className="relative px-6 py-5 border-b border-sidebar-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-gradient-to-b from-primary to-orange-subtle flex items-center justify-center shadow-raised led-orange">
            <Mail className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-foreground tracking-tight text-engraved">
                PropMail
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 leading-none tracking-wide">
                v1.0
              </span>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Real Estate Email
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 px-3 mb-3">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                active
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-foreground border border-primary/20 shadow-raised"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight className="h-3 w-3 text-primary/60" />
              )}
              {active && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary led-orange animate-pulse-glow flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="border-engraved rounded-md p-3 bg-gradient-to-b from-secondary/40 to-secondary/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-status-green led-green animate-pulse-glow" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
              Online
            </span>
          </div>
          <p className="text-xs font-medium text-foreground truncate">
            {session?.user?.name || session?.user?.email}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {session?.user?.email}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors font-mono uppercase tracking-wide"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
