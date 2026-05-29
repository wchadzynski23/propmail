"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Plus, Trash2, CheckCircle2, AlertCircle,
  Loader2, Upload, Users, Search, X, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface Contact {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  tags: string | null;
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

  const [templates, setTemplates]           = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(preselectedId || "");
  const [recipients, setRecipients]         = useState<Recipient[]>([{ id: "1", email: "", name: "" }]);
  const [sending, setSending]               = useState(false);
  const [result, setResult]                 = useState<{ sent: number; skipped?: number; errors: string[] } | null>(null);
  const [error, setError]                   = useState("");
  const [bulkInput, setBulkInput]           = useState("");
  const [showBulk, setShowBulk]             = useState(false);

  // Contact picker state
  const [contacts, setContacts]             = useState<Contact[]>([]);
  const [showPicker, setShowPicker]         = useState(false);
  const [pickerQuery, setPickerQuery]       = useState("");
  const pickerRef                           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then(setTemplates);
    fetch("/api/contacts").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setContacts(data);
    });
  }, []);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const q = pickerQuery.toLowerCase();
    if (!q) return true;
    return (
      c.email.toLowerCase().includes(q) ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q)
    );
  });

  function addFromContact(c: Contact) {
    // Skip if already in list
    if (recipients.some((r) => r.email.toLowerCase() === c.email.toLowerCase())) return;
    // Fill first empty row, otherwise append
    const emptyIdx = recipients.findIndex((r) => !r.email.trim());
    if (emptyIdx !== -1) {
      setRecipients((prev) =>
        prev.map((r, i) => i === emptyIdx ? { ...r, email: c.email, name: c.name || "" } : r)
      );
    } else {
      setRecipients((prev) => [...prev, { id: Date.now().toString(), email: c.email, name: c.name || "" }]);
    }
  }

  function addRecipient() {
    setRecipients((prev) => [...prev, { id: Date.now().toString(), email: "", name: "" }]);
  }

  function removeRecipient(id: string) {
    if (recipients.length === 1) {
      setRecipients([{ id: "1", email: "", name: "" }]);
      return;
    }
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRecipient(id: string, field: "email" | "name", value: string) {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function parseBulkInput() {
    const lines = bulkInput.trim().split("\n").filter(Boolean);
    const parsed: Recipient[] = lines.map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      const email = parts[0] || "";
      const name  = parts.slice(1).join(" ").trim();
      return { id: Date.now().toString() + Math.random(), email, name };
    });
    if (parsed.length > 0) {
      setRecipients(parsed);
      setShowBulk(false);
      setBulkInput("");
    }
  }

  async function handleSend() {
    const validRecipients = recipients.filter((r) => r.email.trim());
    if (!selectedTemplate)            { setError("Please select a template.");           return; }
    if (validRecipients.length === 0) { setError("Add at least one recipient email.");   return; }

    // Name is mandatory
    const missingName = validRecipients.find((r) => !r.name.trim());
    if (missingName) {
      setError(`Full name is required for every recipient. Missing name for: ${missingName.email}`);
      return;
    }

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

  const activeCount = recipients.filter((r) => r.email).length;

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
              {result.skipped ? ` · ${result.skipped} skipped (unsubscribed)` : ""}
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

      {/* Step 1 — Template */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Step 1 — Select Template
        </p>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No templates yet.{" "}
            <a href="/templates/new" className="text-primary hover:brightness-110">Create one first.</a>
          </p>
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

      {/* Step 2 — Recipients */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Step 2 — Recipients ({activeCount})
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulk((v) => !v)}
              className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Upload className="h-3 w-3" />
              Bulk
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-2 gap-2 mb-1.5 px-0.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
            Email <span className="text-destructive">*</span>
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
            Full Name <span className="text-destructive">*</span>
          </p>
        </div>

        {/* Recipient rows */}
        <div className="space-y-2">
          {recipients.map((r, idx) => (
            <div key={r.id} className="flex gap-2 items-center">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  type="email"
                  placeholder={`email@example.com`}
                  value={r.email}
                  onChange={(e) => updateRecipient(r.id, "email", e.target.value)}
                  className={r.email && !r.name ? "border-amber-500/40" : ""}
                />
                <Input
                  placeholder="Required"
                  value={r.name}
                  onChange={(e) => updateRecipient(r.id, "name", e.target.value)}
                  className={r.email && !r.name.trim() ? "border-destructive/50 focus:ring-destructive/30" : ""}
                />
              </div>
              <button
                onClick={() => removeRecipient(r.id)}
                className="h-9 w-9 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
          <Button variant="ghost" size="sm" onClick={addRecipient}>
            <UserPlus className="h-3.5 w-3.5" />
            Add Manually
          </Button>

          {/* Contact picker trigger */}
          <div className="relative" ref={pickerRef}>
            <Button
              variant="metal"
              size="sm"
              onClick={() => { setShowPicker((v) => !v); setPickerQuery(""); }}
            >
              <Users className="h-3.5 w-3.5" />
              Add from Contacts
              {contacts.length > 0 && (
                <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                  ({contacts.length})
                </span>
              )}
            </Button>

            {showPicker && (
              <div className="absolute left-0 top-full mt-1 z-50 w-80 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-border bg-secondary/30">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      autoFocus
                      value={pickerQuery}
                      onChange={(e) => setPickerQuery(e.target.value)}
                      placeholder="Search contacts…"
                      className="w-full bg-transparent pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {pickerQuery && (
                      <button onClick={() => setPickerQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact list */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      {contacts.length === 0 ? "No contacts yet" : "No matches"}
                    </p>
                  ) : (
                    filteredContacts.map((c) => {
                      const already = recipients.some(
                        (r) => r.email.toLowerCase() === c.email.toLowerCase()
                      );
                      return (
                        <button
                          key={c.id}
                          onClick={() => { if (!already) addFromContact(c); }}
                          disabled={already}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-border/30 last:border-0 ${
                            already
                              ? "opacity-40 cursor-default"
                              : "hover:bg-primary/5 cursor-pointer"
                          }`}
                        >
                          {/* Avatar */}
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-primary">
                            {(c.name || c.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {c.name || <span className="text-muted-foreground italic">No name</span>}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                          </div>
                          {already && (
                            <span className="text-[10px] font-mono text-muted-foreground">added</span>
                          )}
                          {c.company && !already && (
                            <span className="text-[10px] text-muted-foreground/60 truncate max-w-[60px]">{c.company}</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {filteredContacts.length > 0 && (
                  <div className="p-2 border-t border-border bg-secondary/20 text-center">
                    <button
                      onClick={() => setShowPicker(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bulk import */}
        {showBulk && (
          <div className="mt-3 p-3 border border-border rounded-md bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-2">
              One per line:{" "}
              <code className="font-mono bg-secondary px-1 rounded">email@example.com, First Last</code>
              {" "}— name is required
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
      </div>

      {/* Send button */}
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
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Email{activeCount > 1 ? ` to ${activeCount} Recipients` : ""}
          </>
        )}
      </Button>
    </div>
  );
}
