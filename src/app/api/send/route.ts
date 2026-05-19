import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { renderBlocksToHtml, renderBlocksToText, Block, AgentFooter } from "@/lib/email-renderer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const settings = await db.userSettings.findUnique({ where: { userId } });
  if (!settings?.resendApiKey) {
    return NextResponse.json(
      { error: "Resend API key not configured. Go to Settings first." },
      { status: 400 }
    );
  }

  const { templateId, recipients } = await req.json() as {
    templateId: string;
    recipients: { email: string; name?: string }[];
  };

  if (!templateId || !recipients?.length) {
    return NextResponse.json({ error: "templateId and recipients are required" }, { status: 400 });
  }

  const template = await db.template.findFirst({ where: { id: templateId, userId } });
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const blocks = JSON.parse(template.blocks) as Block[];
  const resend = new Resend(settings.resendApiKey);

  const from = settings.senderName
    ? `${settings.senderName} <${settings.senderEmail || "onboarding@resend.dev"}>`
    : settings.senderEmail || "onboarding@resend.dev";

  const footer: AgentFooter = {
    agentName:  settings.footerAgentName  || undefined,
    title:      settings.footerTitle      || undefined,
    phone:      settings.footerPhone      || undefined,
    website:    settings.footerWebsite    || undefined,
    address:    settings.footerAddress    || undefined,
    customText: settings.footerCustomText || undefined,
  };

  let successCount = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    const vars: Record<string, string> = {
      name:           recipient.name  || "",
      email:          recipient.email || "",
      // placeholder — agents can hook up a real unsubscribe URL later
      unsubscribeUrl: `mailto:${settings.senderEmail || ""}?subject=Unsubscribe`,
    };

    const [html, text] = await Promise.all([
      renderBlocksToHtml(blocks, vars, footer),
      Promise.resolve(renderBlocksToText(blocks, vars, footer)),
    ]);

    const { error } = await resend.emails.send({
      from,
      to: recipient.email,
      subject: template.subject,
      html,
      text,
      headers: {
        // RFC 2369 — tells email clients to show an Unsubscribe button
        "List-Unsubscribe":      `<mailto:${settings.senderEmail || ""}?subject=Unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        // Precedence bulk signals bulk mail — reduces spam score
        "Precedence": "bulk",
        // X-Mailer for transparency
        "X-Mailer": "PropMail/1.0",
      },
    });

    if (error) {
      errors.push(`${recipient.email}: ${error.message}`);
    } else {
      successCount++;
    }
  }

  await db.emailSend.create({
    data: {
      userId,
      templateId,
      recipients: JSON.stringify(recipients),
      status: errors.length === 0 ? "sent" : errors.length === recipients.length ? "failed" : "partial",
    },
  });

  return NextResponse.json({ sent: successCount, errors });
}
