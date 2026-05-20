"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Plus, Search, X, Save, Trash2, Mail, Phone, Building2,
  Tag, FileText, Clock, CheckCircle2, AlertCircle, Send, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  unsubscribedAt: string | null;
}

interface EmailHistoryItem {
  id: string;
  sentAt: string;
  status: string;
  template: { id: string; name: string; subject: string };
}

interface ContactDetail extends Contact {
  emailHistory: EmailHistoryItem[];
}

const PRESET_TAGS = ["Buyer", "Seller", "Investor", "VIP", "Lead", "Referral"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function avatar(contact: Contact) {
  const letter = (contact.name || contact.email).charAt(0).toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
      {letter}
    </div>
  );
}

function TagPill({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
      {tag}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:text-destructive ml-0.5">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

function StatusBadge({ unsubscribed }: { unsubscribed: boolean }) {
  return unsubscribed ? (
    <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
      <X className="h-2.5 w-2.5" /> Unsubscribed
    </span>
  ) : (
    <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-status-green/10 text-status-green border border-status-green/20">
      <CheckCircle2 className="h-2.5 w-2.5" /> Active
    </span>
  );
}

// ─── Contact detail / edit panel ─────────────────────────────────────────────
function ContactPanel({
  contactId,
  onClose,
  onSaved,
  onDeleted,
}: {
  contactId: string | "new";
  onClose: () => void;
  onSaved: (c: Contact) => void;
  onDeleted: (id: string) => void;
}) {
  const isNew = contactId === "new";

  const [detail, setDetail] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  // form fields
  const [email,   setEmail]   = useState("");
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [company, setCompany] = useState("");
  const [notes,   setNotes]   = useState("");
  const [tags,    setTags]    = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/contacts/${contactId}`)
      .then((r) => r.json())
      .then((d: ContactDetail) => {
        setDetail(d);
        setEmail(d.email);
        setName(d.name || "");
        setPhone(d.phone || "");
        setCompany(d.company || "");
        setNotes(d.notes || "");
        setTags(d.tags ? d.tags.split(",").filter(Boolean) : []);
        setLoading(false);
      });
  }, [contactId, isNew]);

  function addTag(t: string) {
    const cleaned = t.trim();
    if (cleaned && !tags.includes(cleaned)) setTags((prev) => [...prev, cleaned]);
    setTagInput("");
  }

  async function save() {
    setSaving(true); setError("");
    const body = { email, name, phone, company, notes, tags: tags.join(",") };

    const res = isNew
      ? await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch(`/api/contacts/${contactId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    setSaving(false);
    if (!res.ok) { setError("Failed to save."); return; }
    const saved_contact = await res.json() as Contact;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved(saved_contact);
  }

  async function deleteContact() {
    if (!confirm("Delete this contact?")) return;
    setDeleting(true);
    await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
    onDeleted(contactId);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {isNew ? "New Contact" : "Contact Details"}
        </p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 rounded bg-secondary/40 animate-pulse" />)}
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 bg-status-green/10 border border-status-green/20 rounded-md px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-green flex-shrink-0" />
                <p className="text-xs text-foreground">Saved</p>
              </div>
            )}

            {/* Basic fields */}
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@email.com" className="pl-9"
                  readOnly={!isNew} disabled={!isNew} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith" className="pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={company} onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp" className="pl-9" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="h-3 w-3" /> Tags</Label>
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {tags.map((t) => (
                  <TagPill key={t} tag={t} onRemove={() => setTags((prev) => prev.filter((x) => x !== t))} />
                ))}
              </div>
              {/* Preset tags */}
              <div className="flex flex-wrap gap-1">
                {PRESET_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                  <button key={t} type="button" onClick={() => addTag(t)}
                    className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    + {t}
                  </button>
                ))}
              </div>
              {/* Custom tag input */}
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
                placeholder="Custom tag, press Enter"
                className="text-xs h-8" />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private notes about this contact..." rows={3} />
            </div>

            {/* Unsubscribe status (non-edit) */}
            {!isNew && detail && (
              <div className="pt-1">
                <StatusBadge unsubscribed={!!detail.unsubscribedAt} />
                {detail.unsubscribedAt && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Opted out {new Date(detail.unsubscribedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Email history */}
            {!isNew && detail && detail.emailHistory.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                  <Send className="h-3 w-3" /> Email History ({detail.emailHistory.length})
                </p>
                <div className="space-y-1.5">
                  {detail.emailHistory.map((h) => (
                    <div key={h.id} className="border-engraved rounded-md bg-secondary/30 px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{h.template.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{h.template.subject}</p>
                        </div>
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full flex-shrink-0 mt-1.5",
                          h.status === "sent" ? "bg-status-green" : "bg-destructive"
                        )} />
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(h.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!isNew && detail && detail.emailHistory.length === 0 && (
              <p className="text-xs text-muted-foreground/50 text-center py-2">No emails sent to this contact yet.</p>
            )}
          </>
        )}
      </div>

      {/* Panel footer actions */}
      <div className="border-t border-border px-5 py-3 flex items-center justify-between gap-2">
        {!isNew && (
          <Button variant="ghost" size="sm" onClick={deleteContact} disabled={deleting}
            className="hover:text-destructive hover:bg-destructive/10 text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        )}
        <div className={cn("flex gap-2", isNew && "ml-auto")}>
          <Button variant="metal" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="console" size="sm" onClick={save} disabled={saving || !email}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ContactsPage() {
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [panelId, setPanelId]       = useState<string | "new" | null>(null);

  const load = useCallback(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data: Contact[]) => { setContacts(data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSaved(c: Contact) {
    setContacts((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = c; return next; }
      return [c, ...prev];
    });
    if (panelId === "new") setPanelId(c.id);
  }

  function handleDeleted(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setPanelId(null);
  }

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q) ||
      (c.tags || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full">
      {/* ── Left: contact list ── */}
      <div className={cn("flex flex-col border-r border-border transition-all", panelId ? "w-[55%]" : "w-full")}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-0.5">CRM</p>
            <h1 className="text-xl font-bold text-foreground text-engraved">Contacts</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="console" size="sm" onClick={() => setPanelId("new")}>
            <Plus className="h-3.5 w-3.5" />
            Add Contact
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, company, tag…"
              className="pl-9 h-8 text-sm" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-lg bg-secondary/30 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                {search ? "No contacts match" : "No contacts yet"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {search ? "Try a different search." : "Contacts are created automatically when you send emails, or add them manually."}
              </p>
              {!search && (
                <Button variant="console" size="sm" onClick={() => setPanelId("new")}>
                  <Plus className="h-3.5 w-3.5" /> Add First Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((c) => {
                const selected = panelId === c.id;
                const tagList = c.tags ? c.tags.split(",").filter(Boolean) : [];
                return (
                  <button
                    key={c.id}
                    onClick={() => setPanelId(selected ? null : c.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors group",
                      selected
                        ? "bg-primary/8 border-l-2 border-primary"
                        : "hover:bg-secondary/40 border-l-2 border-transparent"
                    )}
                  >
                    {avatar(c)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.name || c.email}
                        </p>
                        {c.unsubscribedAt && (
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 flex-shrink-0">
                            Unsub
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {c.name ? c.email : ""}
                        {c.name && c.company ? " · " : ""}
                        {c.company || ""}
                      </p>
                      {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tagList.slice(0, 3).map((t) => (
                            <span key={t} className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {t}
                            </span>
                          ))}
                          {tagList.length > 3 && (
                            <span className="font-mono text-[9px] text-muted-foreground">+{tagList.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors",
                      selected ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    )} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      {panelId && (
        <div className="w-[45%] flex flex-col bg-gradient-to-b from-secondary/20 to-background">
          <ContactPanel
            key={panelId}
            contactId={panelId}
            onClose={() => setPanelId(null)}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        </div>
      )}
    </div>
  );
}
