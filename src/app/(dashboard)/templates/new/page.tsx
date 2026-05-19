"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateEditor } from "@/components/template-editor";
import type { Block } from "@/lib/email-renderer";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleBlocksChange = useCallback((b: Block[]) => setBlocks(b), []);

  async function save() {
    if (!name.trim() || !subject.trim()) {
      setError("Template name and subject line are required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, blocks }),
    });

    if (!res.ok) {
      setError("Failed to save template.");
      setSaving(false);
      return;
    }

    const data = await res.json();
    router.push(`/templates/${data.id}`);
  }

  return (
    <div className="relative p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
            New Template
          </p>
          <h1 className="text-2xl font-bold text-foreground text-engraved">Template Builder</h1>
        </div>
        <Button variant="console" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Template"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2.5 mb-6">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Meta fields */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tname">Template Name</Label>
            <Input
              id="tname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Open House Invitation"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Email Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. {{name}}, Your dream home is waiting"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <TemplateEditor onChange={handleBlocksChange} />

      {/* Bottom save */}
      <div className="mt-6 flex justify-end">
        <Button variant="console" onClick={save} disabled={saving} size="lg">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </div>
  );
}
