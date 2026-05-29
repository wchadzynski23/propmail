"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Edit2, Trash2, Send, Clock, Sparkles, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  _count: { sends: number };
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => { setTemplates(data); setLoading(false); });
  }, []);

  async function duplicateTemplate(id: string) {
    setDuplicating(id);
    const res = await fetch(`/api/templates/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const copy = await res.json();
      router.push(`/templates/${copy.id}`);
    }
    setDuplicating(null);
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    setDeleting(id);
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  }

  return (
    <div className="relative p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-1">
            Content Library
          </p>
          <h1 className="text-2xl font-bold text-foreground text-engraved">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {templates.length} template{templates.length !== 1 ? "s" : ""} ready to send
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/templates/gallery">
            <Button variant="metal">
              <Sparkles className="h-4 w-4" />
              Starter Gallery
            </Button>
          </Link>
          <Link href="/templates/new">
            <Button variant="console">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 animate-pulse h-44" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="border-engraved rounded-xl bg-gradient-to-b from-secondary/40 to-secondary/10 p-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No templates yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first template with text, images, Vimeo videos, and CTAs
          </p>
          <Link href="/templates/new">
            <Button variant="console">
              <Plus className="h-4 w-4" />
              Create First Template
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 group hover:border-primary/20 transition-colors relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Icon + title */}
              <div className="flex items-start gap-3 mb-4">
                <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{t.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-4 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  {t._count.sends} send{t._count.sends !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(t.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/templates/${t.id}`} className="flex-1">
                  <Button variant="metal" size="sm" className="w-full">
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateTemplate(t.id)}
                  disabled={duplicating === t.id}
                  title="Duplicate template"
                  className="hover:text-primary hover:bg-primary/10"
                >
                  {duplicating === t.id
                    ? <span className="h-3.5 w-3.5 animate-spin border border-current border-t-transparent rounded-full inline-block" />
                    : <Copy className="h-3.5 w-3.5" />
                  }
                </Button>
                <Link href={`/send?template=${t.id}`}>
                  <Button variant="console" size="sm">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate(t.id)}
                  disabled={deleting === t.id}
                  className="hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
