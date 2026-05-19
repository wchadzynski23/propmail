"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Template {
  id: string;
  name: string;
  subject: string;
}

interface Recipient {
  id: string;
  email: string;
  name: string;
}

export default function SendPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading...</div>}>
      <SendPageInner />
    </Suspense>
  );
}

function SendPageInner() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("template");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(preselectedId || "");
  const [recipients, setRecipients] = useState<Recipient[]>([{ id: "1", email: "", name: "" }]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates);
  }, []);

  function addRecipient() {
    setRecipients((prev) => [...prev, { id: Date.now().toString(), email: "", name: "" }]);
  }

  function removeRecipient(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRecipient(id: string, field: "email" | "name", value: string) {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function parseBulkInput() {
    const lines = bulkInput.trim().split("\n").filter(Boolean);
    const parsed: Recipient[] = lines.map((line) => {
      const [email, ...nameParts] = line.split(",").map((s) => s.trim());
      return { id: Date.now().toString() + Math.random(), email: email || "", name: nameParts.join(" ") || "" };
    });
    if (parsed.length > 0) {
      setRecipients(parsed);
      setShowBulk(false);
      setBulkInput("");
    }
  }

  async function handleSend() {
    const validRecipients = recipients.filter((r) => r.email.trim());
    if (!selectedTemplate) { setError("Please select a template."); return; }
    if (validRecipients.length === 0) { setError("Add at least one recipient email."); return; }

    setSending(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: selectedTemplate, recipients: validRecipients }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error || "Failed to send emails.");
      return;
    }

    setResult(data);
  }

  return (
    <div className="relative p-8 max-w-3xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-1">
          Outbox
        </p>
        <h1 className="text-2xl font-bold text-foreground text-engraved">Send Email</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose a template and add your recipients
        </p>
      </div>

      {/* Success */}
      {result && (
        <div className={`border rounded-lg p-4 mb-6 flex items-start gap-3 ${result.errors.length === 0 ? "bg-status-green/10 border-status-green/30" : "bg-primary/10 border-primary/30"}`}>
          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${result.errors.length === 0 ? "text-status-green" : "text-primary"}`} />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {result.sent} email{result.sent !== 1 ? "s" : ""} sent successfully
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2.5 mb-6">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Template select */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Step 1 — Select Template
        </p>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No templates yet. <a href="/templates/new" className="text-primary hover:brightness-110">Create one first.</a></p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`flex flex-col items-start p-3 rounded-md border text-left transition-all ${
                  selectedTemplate === t.id
                    ? "bg-primary/10 border-primary/30 shadow-raised"
                    : "border-border bg-secondary/30 hover:border-primary/20 hover:bg-secondary/50"
                }`}
              >
                <span className="text-sm font-medium text-foreground">{t.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{t.subject}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recipients */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Step 2 — Recipients ({recipients.filter((r) => r.email).length})
          </p>
          <button
            onClick={() => setShowBulk((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <Upload className="h-3 w-3" />
            Bulk Import
          </button>
        </div>

        {showBulk && (
          <div className="mb-4 p-3 border border-border rounded-md bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-2">
              One per line: <code className="font-mono bg-secondary px-1 rounded">email@example.com, First Last</code>
            </p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-metal-mid px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
              placeholder={"john@example.com, John Smith\njane@example.com, Jane Doe"}
            />
            <Button variant="metal" size="sm" onClick={parseBulkInput} className="mt-2">
              Import
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {recipients.map((r, idx) => (
            <div key={r.id} className="flex gap-2 items-center">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  type="email"
                  placeholder={`Email ${idx + 1}`}
                  value={r.email}
                  onChange={(e) => updateRecipient(r.id, "email", e.target.value)}
                />
                <Input
                  placeholder="Name (optional)"
                  value={r.name}
                  onChange={(e) => updateRecipient(r.id, "name", e.target.value)}
                />
              </div>
              {recipients.length > 1 && (
                <button
                  onClick={() => removeRecipient(r.id)}
                  className="h-9 w-9 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={addRecipient} className="mt-3">
          <Plus className="h-3.5 w-3.5" />
          Add Recipient
        </Button>
      </div>

      {/* Send */}
      <Button
        variant="console"
        size="lg"
        onClick={handleSend}
        disabled={sending}
        className="w-full"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending via Resend...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Email{recipients.filter((r) => r.email).length > 1
              ? ` to ${recipients.filter((r) => r.email).length} Recipients`
              : ""}
          </>
        )}
      </Button>
    </div>
  );
}
