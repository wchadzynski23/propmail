import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { renderBlocksToHtml, renderBlocksToText, Block, AgentFooter } from "@/lib/email-renderer";

const ANTI_SPAM_HEADERS = (senderEmail: string) => ({
  "List-Unsubscribe":      `<mailto:${senderEmail}?subject=Unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  "Precedence":            "bulk",
  "X-Mailer":              "PropMail/1.0",
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const settings = await db.userSettings.findUnique({ where: { userId } });

  const provider = settings?.smtpProvider || "resend";

  // Validate provider credentials exist
  if (provider === "resend" && !settings?.resendApiKey) {
    return NextResponse.json(
      { error: "Resend API key not configured. Go to Settings first." },
      { status: 400 }
    );
  }
  if (provider !== "resend" && (!settings?.smtpUser || !settings?.smtpPassword)) {
    return NextResponse.json(
      { error: "SMTP credentials not configured. Go to Settings first." },
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

  const from = settings?.senderName
    ? `${settings.senderName} <${settings.senderEmail || settings.smtpUser || ""}>`
    : settings?.senderEmail || settings?.smtpUser || "";

  const footer: AgentFooter = {
    agentName:  settings?.footerAgentName  || undefined,
    title:      settings?.footerTitle      || undefined,
    phone:      settings?.footerPhone      || undefined,
    website:    settings?.footerWebsite    || undefined,
    address:    settings?.footerAddress    || undefined,
    customText: settings?.footerCustomText || undefined,
  };

  // Build SMTP transporter once if needed
  let smtpTransporter: nodemailer.Transporter | null = null;
  if (provider !== "resend") {
    smtpTransporter = nodemailer.createTransport({
      host:   settings!.smtpHost!,
      port:   settings!.smtpPort!,
      secure: settings!.smtpSecure ?? false,
      auth: {
        user: settings!.smtpUser!,
        pass: settings!.smtpPassword!,
      },
    });
  }

  const resend = provider === "resend" ? new Resend(settings!.resendApiKey!) : null;
  const replyTo = settings?.senderEmail || settings?.smtpUser || "";

  let successCount = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    const vars: Record<string, string> = {
      name:           recipient.name  || "",
      email:          recipient.email || "",
      unsubscribeUrl: `mailto:${replyTo}?subject=Unsubscribe`,
    };

    const [html, text] = await Promise.all([
      renderBlocksToHtml(blocks, vars, footer),
      Promise.resolve(renderBlocksToText(blocks, vars, footer)),
    ]);

    try {
      if (provider === "resend" && resend) {
        const { error } = await resend.emails.send({
          from,
          to: recipient.email,
          subject: template.subject,
          html,
          text,
          headers: ANTI_SPAM_HEADERS(replyTo),
        });
        if (error) throw new Error(error.message);
      } else if (smtpTransporter) {
        await smtpTransporter.sendMail({
          from,
          to: recipient.email,
          subject: template.subject,
          html,
          text,
          headers: ANTI_SPAM_HEADERS(replyTo),
        });
      }
      successCount++;
    } catch (err) {
      errors.push(`${recipient.email}: ${err instanceof Error ? err.message : String(err)}`);
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
