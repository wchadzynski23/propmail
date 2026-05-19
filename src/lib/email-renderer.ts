import { extractVimeoId } from "./utils";

export type Block =
  | { type: "heading"; content: string; level: 1 | 2 | 3 }
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; vimeoUrl: string; caption?: string }
  | { type: "button"; label: string; url: string; color?: string }
  | { type: "divider" }
  | { type: "spacer"; size: "sm" | "md" | "lg" };

export function renderBlocksToHtml(
  blocks: Block[],
  variables: Record<string, string> = {}
): string {
  const rendered = blocks.map((block) => renderBlock(block, variables)).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .content { padding: 40px; }
    img { max-width: 100%; height: auto; display: block; border-radius: 8px; }
    a { color: inherit; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="content">
        ${rendered}
      </div>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px;">
      Sent via PropMail · Unsubscribe
    </p>
  </div>
</body>
</html>`;
}

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

function renderBlock(block: Block, vars: Record<string, string>): string {
  switch (block.type) {
    case "heading": {
      const sizes: Record<number, string> = {
        1: "font-size:28px;font-weight:800;",
        2: "font-size:22px;font-weight:700;",
        3: "font-size:18px;font-weight:600;",
      };
      const style = `margin:0 0 16px 0;color:#111827;line-height:1.3;${sizes[block.level]}`;
      return `<h${block.level} style="${style}">${interpolate(block.content, vars)}</h${block.level}>`;
    }
    case "text":
      return `<p style="margin:0 0 20px 0;font-size:16px;line-height:1.7;color:#374151;">${interpolate(block.content, vars).replace(/\n/g, "<br/>")}</p>`;
    case "image":
      return `<div style="margin:0 0 24px 0;"><img src="${block.url}" alt="${block.alt || ""}" style="width:100%;border-radius:8px;" /></div>`;
    case "video": {
      const id = extractVimeoId(block.vimeoUrl);
      if (!id) return "";
      return `<div style="margin:0 0 24px 0;">
        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000;">
          <iframe src="https://player.vimeo.com/video/${id}?badge=0&autopause=0&player_id=0&app_id=58479"
            style="position:absolute;top:0;left:0;width:100%;height:100%;"
            frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
        ${block.caption ? `<p style="font-size:13px;color:#9ca3af;text-align:center;margin-top:8px;">${block.caption}</p>` : ""}
      </div>`;
    }
    case "button": {
      const bg = block.color || "#f97316";
      return `<div style="margin:0 0 24px 0;text-align:center;">
        <a href="${block.url}" style="display:inline-block;padding:14px 32px;background:${bg};color:#fff;font-weight:600;font-size:15px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
          ${interpolate(block.label, vars)}
        </a>
      </div>`;
    }
    case "divider":
      return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`;
    case "spacer": {
      const heights = { sm: "16px", md: "32px", lg: "48px" };
      return `<div style="height:${heights[block.size]};"></div>`;
    }
    default:
      return "";
  }
}
