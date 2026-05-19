"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Copy, CheckCircle2, Video, Image as ImgIcon, MousePointerClick, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STARTER_TEMPLATES } from "@/lib/starter-templates";
import { cn } from "@/lib/utils";

function blockSummary(blocks: { type: string }[]) {
  const counts = { video: 0, image: 0, button: 0, text: 0, heading: 0 };
  for (const b of blocks) {
    if (b.type in counts) counts[b.type as keyof typeof counts]++;
  }
  const items = [];
  if (counts.video)   items.push({ icon: Video, label: `${counts.video} Video${counts.video > 1 ? "s" : ""}` });
  if (counts.image)   items.push({ icon: ImgIcon, label: `${counts.image} Image${counts.image > 1 ? "s" : ""}` });
  if (counts.button)  items.push({ icon: MousePointerClick, label: `${counts.button} CTA${counts.button > 1 ? "s" : ""}` });
  if (counts.heading + counts.text > 0) items.push({ icon: FileText, label: `${counts.heading + counts.text} Text blocks` });
  return items;
}

export default function GalleryPage() {
  const router = useRouter();
  const [cloning, setCloning] = useState<string | null>(null);
  const [cloned, setCloned]   = useState<string | null>(null);

  async function useTemplate(starterId: string) {
    setCloning(starterId);
    const res = await fetch("/api/starters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starterId }),
    });
    if (res.ok) {
      const { id } = await res.json() as { id: string };
      setCloned(starterId);
      setTimeout(() => router.push(`/templates/${id}`), 900);
    }
    setCloning(null);
  }

  return (
    <div className="relative p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/templates">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">Starter Kit</p>
          <h1 className="text-2xl font-bold text-foreground text-engraved">Template Gallery</h1>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-8 ml-12">
        5 professionally written real estate templates — ready to personalise and send.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {STARTER_TEMPLATES.map((t) => {
          const summary = blockSummary(t.blocks);
          const isCloning = cloning === t.id;
          const isCloned  = cloned  === t.id;

          return (
            <div key={t.id}
              className="border-engraved rounded-xl bg-gradient-to-b from-secondary/40 to-secondary/10 overflow-hidden group hover:border-primary/20 transition-all">

              {/* Color strip */}
              <div className="h-1" style={{ background: t.badgeColor }} />

              <div className="p-5">
                {/* Badge + title */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <span
                      className="inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
                      style={{ backgroundColor: `${t.badgeColor}20`, color: t.badgeColor }}
                    >
                      {t.badge}
                    </span>
                    <h3 className="font-bold text-foreground text-base leading-tight">{t.name}</h3>
                  </div>
                  <Sparkles className="h-4 w-4 flex-shrink-0 mt-1" style={{ color: t.badgeColor }} />
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t.description}</p>

                {/* Block summary */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {summary.map(({ icon: Icon, label }) => (
                    <span key={label} className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/60 border border-border px-2 py-1 rounded-md font-mono">
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                </div>

                {/* Subject preview */}
                <div className="bg-secondary/40 rounded-md px-3 py-2 mb-5 border border-border/50">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-0.5">Subject line</p>
                  <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                </div>

                {/* Action */}
                <Button
                  variant={isCloned ? "metal" : "console"}
                  className="w-full"
                  onClick={() => useTemplate(t.id)}
                  disabled={isCloning || isCloned}
                >
                  {isCloned ? (
                    <><CheckCircle2 className="h-4 w-4 text-status-green" /> Opening editor...</>
                  ) : isCloning ? (
                    <><span className="animate-spin inline-block h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" /> Cloning...</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Use This Template</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom tip */}
      <div className="mt-8 border border-primary/10 rounded-lg bg-primary/5 p-4 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Tip:</span>{" "}
          Replace placeholder Vimeo URLs with your own videos in the template editor. Use{" "}
          <code className="font-mono text-primary text-xs">{"{{name}}"}</code> in any text block to personalise with the recipient&apos;s name.
        </p>
      </div>
    </div>
  );
}
