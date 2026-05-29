"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, AlertCircle, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateEditor } from "@/components/template-editor";
import type { Block } from "@/lib/email-renderer";

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name);
        setSubject(data.subject);
        setBlocks(JSON.parse(data.blocks || "[]"));
        setLoading(false);
      });
  }, [id]);

  const handleBlocksChange = useCallback((b: Block[]) => setBlocks(b), []);

  async function duplicate() {
    setDuplicating(true);
    const res = await fetch(`/api/templates/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const copy = await res.json();
      router.push(`/templates/${copy.id}`);
    }
    setDuplicating(false);
  }

  async function save() {
    if (!name.trim() || !subject.trim()) {
      setError("Template name and subject line are required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, blocks }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Failed to save.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
            Editing Template
          </p>
          <h1 className="text-2xl font-bold text-foreground text-engraved">{name || "Untitled"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={duplicate} disabled={duplicating} title="Duplicate as new template">
            {duplicating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Copy className="h-4 w-4" />
            }
            {duplicating ? "Copying..." : "Duplicate"}
          </Button>
          <Link href={`/send?template=${id}`}>
            <Button variant="metal">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </Link>
          <Button variant="console" onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2.5 mb-6">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4">
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

      {blocks.length >= 0 && (
        <TemplateEditor initialBlocks={blocks} onChange={handleBlocksChange} />
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="console" onClick={save} disabled={saving} size="lg">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Template"}
        </Button>
      </div>
    </div>
  );
}
