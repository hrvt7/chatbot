import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, getLeads } from "@/lib/db/queries";

const leadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(50),
  email: z.string().email().optional().or(z.literal("")),
  preferredTime: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(5).max(1_500),
});

async function sendResendNotification(payload: {
  name: string;
  phone: string;
  email?: string;
  preferredTime?: string;
  message: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.LEADS_NOTIFY_EMAIL;

  if (!resendApiKey || !notifyEmail) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Csimborasszó asszisztens <onboarding@resend.dev>",
      to: [notifyEmail],
      subject: "Új visszahívási kérés érkezett",
      html: `<h2>Új lead</h2>
      <p><strong>Név:</strong> ${payload.name}</p>
      <p><strong>Telefon:</strong> ${payload.phone}</p>
      <p><strong>E-mail:</strong> ${payload.email || "-"}</p>
      <p><strong>Preferált időpont:</strong> ${payload.preferredTime || "-"}</p>
      <p><strong>Üzenet:</strong><br/>${payload.message}</p>`,
    }),
  });
}

export async function GET() {
  const cookieStore = await cookies();

  if (cookieStore.get("admin-auth")?.value !== "ok") {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 401 });
  }

  const leads = await getLeads();
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Hibás adatok.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = {
    ...parsed.data,
    email: parsed.data.email || undefined,
    preferredTime: parsed.data.preferredTime || undefined,
  };

  const lead = await createLead(payload);
  await sendResendNotification(payload);

  return NextResponse.json({ ok: true, leadId: lead.id });
}
