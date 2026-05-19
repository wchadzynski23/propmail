import { extractVimeoId } from "./utils";

export type Block =
  | { type: "heading"; content: string; level: 1 | 2 | 3 }
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; vimeoUrl: string; caption?: string }
  | { type: "button"; label: string; url: string; color?: string }
  | { type: "divider" }
  | { type: "spacer"; size: "sm" | "md" | "lg" };

async function fetchVimeoThumbnail(id: string): Promise<string> {
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&width=600`);
    if (!res.ok) return "";
    const data = await res.json() as { thumbnail_url?: string };
    return data.thumbnail_url || "";
  } catch {
    return "";
  }
}

export async function renderBlocksToHtml(
  blocks: Block[],
  variables: Record<string, string> = {}
): Promise<string> {
  const renderedBlocks = await Promise.all(blocks.map((b) => renderBlock(b, variables)));
  const rendered = renderedBlocks.join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Email</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f0f13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${variables.preheader || "A message from your real estate agent."}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f13;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Outer container -->
        <table role="presentation" width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

          <!-- Top accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#f97316,#fb923c,#fdba74);border-radius:3px 3px 0 0;"></td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#1a1a24;border-radius:0 0 20px 20px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.6);">

              <!-- Card content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:48px 48px 40px;">
                    ${rendered}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:0 48px 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:24px;">
                          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                            You received this email because you are a valued client.
                            <br/>
                            <a href="#" style="color:#f97316;text-decoration:none;">Unsubscribe</a>
                            &nbsp;·&nbsp;
                            <a href="#" style="color:#6b7280;text-decoration:none;">Privacy Policy</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Bottom brand tag -->
          <tr>
            <td align="center" style="padding:20px 0 0;">
              <p style="margin:0;font-size:11px;color:#374151;letter-spacing:0.1em;text-transform:uppercase;">
                Sent via <span style="color:#f97316;">PropMail</span>
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

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

async function renderBlock(block: Block, vars: Record<string, string>): Promise<string> {
  switch (block.type) {

    case "heading": {
      const styles: Record<number, string> = {
        1: "font-size:32px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;",
        2: "font-size:24px;font-weight:700;letter-spacing:-0.01em;line-height:1.3;",
        3: "font-size:18px;font-weight:600;line-height:1.4;",
      };
      return `<h${block.level} style="margin:0 0 20px 0;color:#f9fafb;${styles[block.level]}">${interpolate(block.content, vars)}</h${block.level}>`;
    }

    case "text":
      return `<p style="margin:0 0 24px 0;font-size:16px;line-height:1.8;color:#9ca3af;">${interpolate(block.content, vars).replace(/\n/g, "<br/>")}</p>`;

    case "image":
      if (!block.url) return "";
      return `
        <div style="margin:0 0 28px 0;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
          <img src="${block.url}" alt="${block.alt || ""}" width="100%" style="display:block;width:100%;height:auto;border-radius:12px;" />
        </div>`;

    case "video": {
      const id = extractVimeoId(block.vimeoUrl);
      if (!id) return "";

      const thumbnail = await fetchVimeoThumbnail(id);
      const vimeoLink = `https://vimeo.com/${id}`;

      const imgHtml = thumbnail
        ? `<img src="${thumbnail}" alt="Watch video" width="504" style="display:block;width:100%;height:auto;border-radius:12px;" />`
        : `<div style="width:100%;aspect-ratio:16/9;background:#111;border-radius:12px;"></div>`;

      return `
        <div style="margin:0 0 28px 0;">
          <a href="${vimeoLink}" target="_blank" style="display:block;position:relative;border-radius:12px;overflow:hidden;text-decoration:none;border:1px solid rgba(255,255,255,0.08);">
            ${imgHtml}
            <!-- Play button overlay -->
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.1) 100%);display:flex;align-items:center;justify-content:center;">
              <table role="presentation" width="100%" height="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" valign="middle">
                    <div style="width:72px;height:72px;background:rgba(249,115,22,0.92);border-radius:50%;display:inline-block;line-height:72px;text-align:center;box-shadow:0 8px 32px rgba(249,115,22,0.5);">
                      <span style="display:inline-block;width:0;height:0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:22px solid #fff;margin-left:6px;vertical-align:middle;"></span>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </a>
          ${block.caption ? `<p style="font-size:13px;color:#6b7280;text-align:center;margin:10px 0 0;">${block.caption}</p>` : ""}
          <p style="margin:10px 0 0;text-align:center;">
            <a href="${vimeoLink}" target="_blank" style="font-size:13px;color:#f97316;text-decoration:none;letter-spacing:0.02em;">▶ Watch on Vimeo</a>
          </p>
        </div>`;
    }

    case "button": {
      const bg = block.color || "#f97316";
      return `
        <div style="margin:8px 0 32px;text-align:center;">
          <a href="${block.url}" target="_blank"
            style="display:inline-block;padding:16px 40px;background:${bg};color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.04em;text-decoration:none;border-radius:10px;text-transform:uppercase;box-shadow:0 4px 24px rgba(249,115,22,0.35);">
            ${interpolate(block.label, vars)}
          </a>
        </div>`;
    }

    case "divider":
      return `<div style="margin:8px 0 32px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);"></div>`;

    case "spacer": {
      const heights = { sm: "16px", md: "32px", lg: "56px" };
      return `<div style="height:${heights[block.size]};line-height:${heights[block.size]};font-size:1px;">&nbsp;</div>`;
    }

    default:
      return "";
  }
}
