import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendVerificationEmail(to: string, token: string) {
  if (!resend) {
    console.error("RESEND_API_KEY is not set, skipping verification email.");
    return;
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.error("RESEND_FROM_EMAIL is not set");
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "تأكيد بريدك في ريتات",
    html: `
      <p>شكرًا لتسجيلك في ريتات.</p>
      <p>اضغط على الرابط التالي لتفعيل بريدك الإلكتروني:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد.</p>
    `,
  });
}
