import { extractVimeoId } from "./utils";

export type Block =
  | { type: "heading"; content: string; level: 1 | 2 | 3 }
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; vimeoUrl: string; caption?: string }
  | { type: "button"; label: string; url: string; color?: string }
  | { type: "divider" }
  | { type: "spacer"; size: "sm" | "md" | "lg" };

export interface AgentFooter {
  agentName?: string;
  title?: string;
  phone?: string;
  website?: string;
  address?: string;     // Physical address — CAN-SPAM required
  customText?: string;
}

async function fetchVimeoThumbnail(id: string): Promise<string> {
  // Strategy 1 — oEmbed (returns high-res thumbnail)
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F${id}&width=600`,
      { cache: "force-cache" }
    );
    if (res.ok) {
      const data = await res.json() as { thumbnail_url?: string };
      if (data.thumbnail_url) return data.thumbnail_url;
    }
  } catch { /* fall through */ }

  // Strategy 2 — Simple API v2 (more permissive, works for more videos)
  try {
    const res = await fetch(
      `https://vimeo.com/api/v2/video/${id}.json`,
      { cache: "force-cache" }
    );
    if (res.ok) {
      const data = await res.json() as Array<{ thumbnail_large?: string; thumbnail_medium?: string }>;
      const thumb = data?.[0]?.thumbnail_large || data?.[0]?.thumbnail_medium;
      if (thumb) return thumb;
    }
  } catch { /* fall through */ }

  return "";
}

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

// ─── Plain-text renderer (for spam prevention) ───────────────────────────────

export function renderBlocksToText(
  blocks: Block[],
  variables: Record<string, string> = {},
  footer?: AgentFooter
): string {
  const lines: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        lines.push(`\n${interpolate(block.content, variables).toUpperCase()}\n${"─".repeat(40)}`);
        break;
      case "text":
        lines.push(interpolate(block.content, variables));
        break;
      case "image":
        if (block.url) lines.push(`[Image: ${block.alt || block.url}]`);
        break;
      case "video":
        lines.push(`▶ Watch video: ${block.vimeoUrl}${block.caption ? ` — ${block.caption}` : ""}`);
        break;
      case "button":
        lines.push(`→ ${interpolate(block.label, variables)}: ${block.url}`);
        break;
      case "divider":
        lines.push("─".repeat(40));
        break;
      case "spacer":
        lines.push("");
        break;
    }
  }

  if (footer) {
    lines.push("\n" + "─".repeat(40));
    if (footer.customText) lines.push(footer.customText);
    if (footer.agentName) lines.push(footer.agentName);
    if (footer.title) lines.push(footer.title);
    if (footer.phone) lines.push(`Tel: ${footer.phone}`);
    if (footer.website) lines.push(footer.website);
    if (footer.address) lines.push(`\n${footer.address}`);
  }

  return lines.join("\n\n");
}

// ─── HTML renderer ────────────────────────────────────────────────────────────

export async function renderBlocksToHtml(
  blocks: Block[],
  variables: Record<string, string> = {},
  footer?: AgentFooter
): Promise<string> {
  const renderedBlocks = await Promise.all(blocks.map((b) => renderBlock(b, variables)));
  const bodyContent = renderedBlocks.join("");
  const footerHtml = renderFooterHtml(footer);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Email</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0f0f13; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-weight: inherit; line-height: inherit; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid { max-width: 100% !important; height: auto !important; }
      .stack-column, .stack-column-center { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
      .stack-column-center { text-align: center !important; }
      .content-padding { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0f0f13;word-break:break-word;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0f0f13;">
    ${variables.preheader || "A message from your real estate agent"}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f13;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">

        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Orange accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#c2410c,#f97316,#fb923c,#fdba74,#fb923c,#f97316,#c2410c);border-radius:4px 4px 0 0;"></td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:#1a1a24;border-radius:0 0 24px 24px;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Body content -->
                <tr>
                  <td class="content-padding" style="padding:52px 48px 40px;">
                    ${bodyContent}
                  </td>
                </tr>

                <!-- Agent footer / signature -->
                ${footerHtml}

                <!-- Legal footer (CAN-SPAM / GDPR) -->
                <tr>
                  <td style="padding:0 48px 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
                          <p style="margin:0 0 6px;font-size:11px;line-height:1.6;color:#4b5563;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            You received this email because you are a valued client.
                            To stop receiving emails,
                            <a href="{{unsubscribeUrl}}" style="color:#f97316;text-decoration:none;">unsubscribe here</a>.
                          </p>
                          ${footer?.address ? `<p style="margin:0;font-size:11px;color:#374151;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${footer.address}</p>` : ""}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- PropMail brand tag -->
          <tr>
            <td align="center" style="padding:20px 0 0;">
              <p style="margin:0;font-size:11px;color:#374151;letter-spacing:0.1em;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                Powered by <span style="color:#f97316;">PropMail</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function renderFooterHtml(footer?: AgentFooter): string {
  if (!footer || (!footer.agentName && !footer.phone && !footer.website)) return "";

  const avatar = footer.agentName
    ? `<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#f97316,#c2410c);display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;text-align:center;line-height:48px;font-family:sans-serif;">${footer.agentName.charAt(0).toUpperCase()}</div>`
    : "";

  return `
  <tr>
    <td style="padding:0 48px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:16px;vertical-align:top;">${avatar}</td>
                <td style="vertical-align:top;">
                  ${footer.customText ? `<p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#9ca3af;font-style:italic;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">"${footer.customText}"</p>` : ""}
                  ${footer.agentName ? `<p style="margin:0 0 2px;font-size:16px;font-weight:700;color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${footer.agentName}</p>` : ""}
                  ${footer.title ? `<p style="margin:0 0 6px;font-size:12px;color:#f97316;letter-spacing:0.03em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${footer.title}</p>` : ""}
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      ${footer.phone ? `<td style="padding-right:16px;"><a href="tel:${footer.phone}" style="font-size:13px;color:#9ca3af;text-decoration:none;font-family:sans-serif;">📞 ${footer.phone}</a></td>` : ""}
                      ${footer.website ? `<td><a href="${footer.website}" target="_blank" style="font-size:13px;color:#f97316;text-decoration:none;font-family:sans-serif;">🌐 ${footer.website.replace(/^https?:\/\//, "")}</a></td>` : ""}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

async function renderBlock(block: Block, vars: Record<string, string>): Promise<string> {
  switch (block.type) {

    case "heading": {
      const styles: Record<number, string> = {
        1: "font-size:34px;font-weight:800;letter-spacing:-0.025em;line-height:1.15;",
        2: "font-size:26px;font-weight:700;letter-spacing:-0.01em;line-height:1.25;",
        3: "font-size:19px;font-weight:600;line-height:1.4;",
      };
      return `<h${block.level} style="margin:0 0 20px;color:#f9fafb;${styles[block.level]}font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${interpolate(block.content, vars)}</h${block.level}>`;
    }

    case "text":
      return `<p style="margin:0 0 24px;font-size:16px;line-height:1.85;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${interpolate(block.content, vars).replace(/\n/g, "<br/>")}</p>`;

    case "image":
      if (!block.url) return "";
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
          <tr><td style="border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">
            <img src="${block.url}" alt="${block.alt || ""}" width="504" class="fluid"
              style="display:block;width:100%;max-width:504px;height:auto;border-radius:14px;" />
          </td></tr>
        </table>`;

    case "video": {
      const id = extractVimeoId(block.vimeoUrl);
      if (!id) return "";
      const thumbnail = await fetchVimeoThumbnail(id);
      const vimeoLink = `https://vimeo.com/${id}`;

      // Email-safe video card: thumbnail row + play-button row (no position:absolute)
      const thumbnailRow = thumbnail
        ? `
          <tr>
            <td style="padding:0;border-radius:14px 14px 0 0;overflow:hidden;line-height:0;font-size:0;">
              <a href="${vimeoLink}" target="_blank" style="display:block;text-decoration:none;line-height:0;font-size:0;">
                <img src="${thumbnail}"
                  alt="${block.caption ? block.caption : "Watch video on Vimeo"}"
                  width="504"
                  class="fluid"
                  style="display:block;width:100%;max-width:504px;height:auto;border:0;outline:none;text-decoration:none;" />
              </a>
            </td>
          </tr>`
        : `
          <tr>
            <td style="background:#0d0d14;padding:48px 0;border-radius:14px 14px 0 0;text-align:center;">
              <p style="margin:0;font-size:14px;color:#4b5563;font-family:sans-serif;">Video preview unavailable</p>
            </td>
          </tr>`;

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="margin:0 0 28px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.09);">
          <!-- Thumbnail -->
          ${thumbnailRow}
          <!-- Play button bar -->
          <tr>
            <td align="center" style="background:#141420;padding:14px 24px;border-radius:0 0 14px 14px;">
              <a href="${vimeoLink}" target="_blank"
                style="display:inline-block;padding:10px 24px;background-color:#f97316;border-radius:8px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">
                &#9658;&nbsp;&nbsp;${block.caption ? block.caption : "Watch on Vimeo"}
              </a>
            </td>
          </tr>
        </table>`;
    }

    case "button": {
      const bg = block.color || "#f97316";
      return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto 32px;text-align:center;width:100%;">
          <tr><td align="center">
            <a href="${block.url}" target="_blank"
              style="display:inline-block;padding:17px 44px;background-color:${bg};color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:700;letter-spacing:0.05em;text-decoration:none;border-radius:12px;text-transform:uppercase;mso-padding-alt:0;box-shadow:0 6px 28px rgba(249,115,22,0.4);">
              <!--[if mso]><i style="letter-spacing:44px;mso-font-width:-100%;mso-text-raise:20pt">&nbsp;</i><![endif]-->
              ${interpolate(block.label, vars)}
              <!--[if mso]><i style="letter-spacing:44px;mso-font-width:-100%">&nbsp;</i><![endif]-->
            </a>
          </td></tr>
        </table>`;
    }

    case "divider":
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 32px;">
          <tr><td style="height:1px;background:linear-gradient(90deg,rgba(249,115,22,0),rgba(249,115,22,0.25),rgba(249,115,22,0));font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>`;

    case "spacer": {
      const h = { sm: "16", md: "32", lg: "56" }[block.size];
      return `<div style="height:${h}px;line-height:${h}px;font-size:1px;">&nbsp;</div>`;
    }

    default:
      return "";
  }
}
