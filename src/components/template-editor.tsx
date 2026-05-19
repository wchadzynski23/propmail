"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Type,
  Heading1,
  Image as ImageIcon,
  Video,
  MousePointerClick,
  Minus,
  Space,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, extractVimeoId } from "@/lib/utils";
import type { Block } from "@/lib/email-renderer";

type EditorBlock = Block & { id: string };

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

const BLOCK_TYPES: { type: Block["type"]; label: string; icon: React.ElementType; description: string }[] = [
  { type: "heading", label: "Heading", icon: Heading1, description: "Title or section header" },
  { type: "text", label: "Text", icon: Type, description: "Paragraph body copy" },
  { type: "image", label: "Image", icon: ImageIcon, description: "Image from URL" },
  { type: "video", label: "Vimeo Video", icon: Video, description: "Embedded Vimeo player" },
  { type: "button", label: "Button", icon: MousePointerClick, description: "CTA button with link" },
  { type: "divider", label: "Divider", icon: Minus, description: "Horizontal line" },
  { type: "spacer", label: "Spacer", icon: Space, description: "Vertical whitespace" },
];

function createBlock(type: Block["type"]): EditorBlock {
  const id = generateId();
  switch (type) {
    case "heading":
      return { id, type: "heading", content: "Your Heading Here", level: 1 } as EditorBlock;
    case "text":
      return { id, type: "text", content: "Enter your text here. Use {{name}} to personalize." } as EditorBlock;
    case "image":
      return { id, type: "image", url: "", alt: "" } as EditorBlock;
    case "video":
      return { id, type: "video", vimeoUrl: "", caption: "" } as EditorBlock;
    case "button":
      return { id, type: "button", label: "Schedule a Tour", url: "https://", color: "#f97316" } as EditorBlock;
    case "divider":
      return { id, type: "divider" } as EditorBlock;
    case "spacer":
      return { id, type: "spacer", size: "md" } as EditorBlock;
    default:
      return { id, type: "text", content: "" } as EditorBlock;
  }
}

function BlockEditor({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: EditorBlock;
  onChange: (b: EditorBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const update = (fields: Partial<EditorBlock>) => onChange({ ...block, ...fields } as EditorBlock);

  return (
    <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/30 to-secondary/10 p-4 group">
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="h-4 w-4 text-muted-foreground/30" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 flex-1">
          {block.type}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {block.type === "heading" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((l) => (
              <button
                key={l}
                onClick={() => update({ level: l } as Partial<EditorBlock>)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono border transition-colors",
                  (block as { level: number }).level === l
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/20"
                )}
              >
                H{l}
              </button>
            ))}
          </div>
          <Input
            value={(block as { content: string }).content}
            onChange={(e) => update({ content: e.target.value } as Partial<EditorBlock>)}
            placeholder="Heading text..."
            className="text-base font-semibold"
          />
        </div>
      )}

      {block.type === "text" && (
        <Textarea
          value={(block as { content: string }).content}
          onChange={(e) => update({ content: e.target.value } as Partial<EditorBlock>)}
          placeholder="Enter text... Use {{name}} or {{email}} for personalization"
          rows={4}
        />
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label>Image URL</Label>
            <Input
              value={(block as { url: string }).url}
              onChange={(e) => update({ url: e.target.value } as Partial<EditorBlock>)}
              placeholder="https://example.com/property.jpg"
            />
          </div>
          <div className="space-y-1">
            <Label>Alt Text</Label>
            <Input
              value={(block as { alt: string }).alt}
              onChange={(e) => update({ alt: e.target.value } as Partial<EditorBlock>)}
              placeholder="Property at 123 Main St"
            />
          </div>
          {(block as { url: string }).url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(block as { url: string }).url}
              alt={(block as { alt: string }).alt}
              className="w-full max-h-40 object-cover rounded-md border border-border"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label>Vimeo URL</Label>
            <Input
              value={(block as { vimeoUrl: string }).vimeoUrl}
              onChange={(e) => update({ vimeoUrl: e.target.value } as Partial<EditorBlock>)}
              placeholder="https://vimeo.com/123456789"
            />
          </div>
          <div className="space-y-1">
            <Label>Caption (optional)</Label>
            <Input
              value={(block as { caption?: string }).caption || ""}
              onChange={(e) => update({ caption: e.target.value } as Partial<EditorBlock>)}
              placeholder="Virtual property tour"
            />
          </div>
          {(block as { vimeoUrl: string }).vimeoUrl && extractVimeoId((block as { vimeoUrl: string }).vimeoUrl) && (
            <div className="relative bg-black rounded-md overflow-hidden aspect-video border border-border">
              <iframe
                src={`https://player.vimeo.com/video/${extractVimeoId((block as { vimeoUrl: string }).vimeoUrl)}?badge=0&autopause=0`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {block.type === "button" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Button Label</Label>
              <Input
                value={(block as { label: string }).label}
                onChange={(e) => update({ label: e.target.value } as Partial<EditorBlock>)}
                placeholder="Schedule a Tour"
              />
            </div>
            <div className="space-y-1">
              <Label>Button Color</Label>
              <div className="flex gap-2">
                <Input
                  value={(block as { color?: string }).color || "#f97316"}
                  onChange={(e) => update({ color: e.target.value } as Partial<EditorBlock>)}
                  placeholder="#f97316"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={(block as { color?: string }).color || "#f97316"}
                  onChange={(e) => update({ color: e.target.value } as Partial<EditorBlock>)}
                  className="h-9 w-9 rounded-md border border-border bg-metal-mid cursor-pointer p-1"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Link URL</Label>
            <Input
              value={(block as { url: string }).url}
              onChange={(e) => update({ url: e.target.value } as Partial<EditorBlock>)}
              placeholder="https://calendly.com/yourbooking"
            />
          </div>
          <div className="flex justify-center pt-1">
            <div
              className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
              style={{ backgroundColor: (block as { color?: string }).color || "#f97316" }}
            >
              {(block as { label: string }).label || "Button"}
            </div>
          </div>
        </div>
      )}

      {block.type === "divider" && (
        <div className="py-2">
          <hr className="border-t border-border" />
        </div>
      )}

      {block.type === "spacer" && (
        <div className="space-y-1">
          <Label>Size</Label>
          <div className="flex gap-2">
            {(["sm", "md", "lg"] as const).map((s) => (
              <button
                key={s}
                onClick={() => update({ size: s } as Partial<EditorBlock>)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-mono border transition-colors",
                  (block as { size: string }).size === s
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/20"
                )}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateEditorProps {
  initialBlocks?: Block[];
  onChange: (blocks: Block[]) => void;
}

export function TemplateEditor({ initialBlocks = [], onChange }: TemplateEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    initialBlocks.length > 0
      ? initialBlocks.map((b) => ({ ...b, id: generateId() } as EditorBlock))
      : []
  );
  const [preview, setPreview] = useState(false);

  const updateBlocks = useCallback(
    (updated: EditorBlock[]) => {
      setBlocks(updated);
      onChange(updated.map(({ id: _id, ...rest }) => rest as Block));
    },
    [onChange]
  );

  function addBlock(type: Block["type"]) {
    const newBlock = createBlock(type);
    updateBlocks([...blocks, newBlock]);
  }

  function updateBlock(id: string, updated: EditorBlock) {
    updateBlocks(blocks.map((b) => (b.id === id ? updated : b)));
  }

  function deleteBlock(id: string) {
    updateBlocks(blocks.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id);
    const newBlocks = [...blocks];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newBlocks.length) return;
    [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
    updateBlocks(newBlocks);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="border-engraved rounded-lg bg-gradient-to-b from-secondary/40 to-secondary/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Add Block
          </p>
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/20 text-xs text-muted-foreground hover:text-foreground transition-all group"
            >
              <Icon className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Blocks */}
      {blocks.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
          <Plus className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Add blocks above to build your template</p>
        </div>
      ) : preview ? (
        <EmailPreview blocks={blocks} />
      ) : (
        <div className="space-y-2">
          {blocks.map((block, idx) => (
            <BlockEditor
              key={block.id}
              block={block}
              onChange={(updated) => updateBlock(block.id, updated)}
              onDelete={() => deleteBlock(block.id)}
              onMoveUp={() => moveBlock(block.id, -1)}
              onMoveDown={() => moveBlock(block.id, 1)}
              isFirst={idx === 0}
              isLast={idx === blocks.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmailPreview({ blocks }: { blocks: EditorBlock[] }) {
  return (
    <div className="border-engraved rounded-lg overflow-hidden">
      <div className="bg-secondary/80 px-4 py-2 flex items-center gap-2 border-b border-border">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive/60" />
          <div className="h-3 w-3 rounded-full bg-primary/40" />
          <div className="h-3 w-3 rounded-full bg-status-green/60" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground mx-auto">Email Preview — as seen by recipient</span>
      </div>
      {/* Dark email background matching renderer */}
      <div className="p-6" style={{ backgroundColor: "#0f0f13" }}>
        <div className="max-w-xl mx-auto overflow-hidden rounded-b-2xl" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
          {/* Top orange accent bar */}
          <div style={{ height: "3px", background: "linear-gradient(90deg,#f97316,#fb923c,#fdba74)" }} />
          {/* Card */}
          <div style={{ backgroundColor: "#1a1a24", borderRadius: "0 0 20px 20px" }}>
            <div style={{ padding: "40px 40px 32px" }}>
              {blocks.map((block) => (
                <PreviewBlock key={block.id} block={block} />
              ))}
            </div>
            {/* Footer */}
            <div style={{ padding: "0 40px 32px", borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "8px" }}>
              <p style={{ margin: "16px 0 0", fontSize: "12px", color: "#6b7280" }}>
                You received this email because you are a valued client.
                {" · "}
                <span style={{ color: "#f97316" }}>Unsubscribe</span>
              </p>
            </div>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#374151", marginTop: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Sent via <span style={{ color: "#f97316" }}>PropMail</span>
        </p>
      </div>
    </div>
  );
}

function PreviewBlock({ block }: { block: EditorBlock }) {
  switch (block.type) {
    case "heading": {
      const b = block as { type: "heading"; content: string; level: 1 | 2 | 3 };
      const styles = {
        1: { fontSize: "30px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 },
        2: { fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 },
        3: { fontSize: "18px", fontWeight: 600, lineHeight: 1.4 },
      };
      const Tag = `h${b.level}` as "h1" | "h2" | "h3";
      return <Tag style={{ margin: "0 0 20px", color: "#f9fafb", ...styles[b.level] }}>{b.content}</Tag>;
    }
    case "text":
      return <p style={{ margin: "0 0 24px", fontSize: "15px", lineHeight: 1.8, color: "#9ca3af", whiteSpace: "pre-wrap" }}>{(block as { content: string }).content}</p>;
    case "image": {
      const b = block as { url: string; alt: string };
      if (!b.url) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <div style={{ margin: "0 0 28px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        <img src={b.url} alt={b.alt} style={{ display: "block", width: "100%", height: "auto" }} />
      </div>;
    }
    case "video": {
      const b = block as { vimeoUrl: string; caption?: string };
      const id = extractVimeoId(b.vimeoUrl);
      if (!id) return null;
      return <VimeoPreviewBlock vimeoId={id} caption={b.caption} />;
    }
    case "button": {
      const b = block as { label: string; url: string; color?: string };
      return (
        <div style={{ margin: "8px 0 32px", textAlign: "center" }}>
          <span style={{
            display: "inline-block", padding: "16px 40px",
            backgroundColor: b.color || "#f97316", color: "#fff",
            fontSize: "14px", fontWeight: 700, letterSpacing: "0.04em",
            borderRadius: "10px", textTransform: "uppercase", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(249,115,22,0.35)"
          }}>
            {b.label}
          </span>
        </div>
      );
    }
    case "divider":
      return <div style={{ margin: "8px 0 32px", height: "1px", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)" }} />;
    case "spacer": {
      const heights = { sm: 16, md: 32, lg: 56 };
      return <div style={{ height: heights[(block as { size: "sm" | "md" | "lg" }).size] }} />;
    }
    default:
      return null;
  }
}

function VimeoPreviewBlock({ vimeoId, caption }: { vimeoId: string; caption?: string }) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=600`)
      .then((r) => r.json())
      .then((d: { thumbnail_url?: string }) => setThumbnail(d.thumbnail_url || null))
      .catch(() => null);
  }, [vimeoId]);

  return (
    <div style={{ margin: "0 0 28px" }}>
      <a
        href={`https://vimeo.com/${vimeoId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block", position: "relative", borderRadius: "12px", overflow: "hidden", textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="Watch video" style={{ display: "block", width: "100%", height: "auto" }} />
        ) : (
          <div style={{ width: "100%", aspectRatio: "16/9", background: "#111" }} />
        )}
        {/* Play button */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg,rgba(0,0,0,0.3),rgba(0,0,0,0.1))"
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "rgba(249,115,22,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(249,115,22,0.5)"
          }}>
            <div style={{ width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: "20px solid #fff", marginLeft: "4px" }} />
          </div>
        </div>
      </a>
      {caption && <p style={{ fontSize: "13px", color: "#6b7280", textAlign: "center", margin: "10px 0 0" }}>{caption}</p>}
      <p style={{ margin: "8px 0 0", textAlign: "center" }}>
        <a href={`https://vimeo.com/${vimeoId}`} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "13px", color: "#f97316", textDecoration: "none" }}>
          ▶ Watch on Vimeo
        </a>
      </p>
    </div>
  );
}
