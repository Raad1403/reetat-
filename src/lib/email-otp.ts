import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function sendOTPEmail(email: string, otpCode: string): Promise<void> {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "رمز التحقق من البريد الإلكتروني - منصة ريتات",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #f59e0b; margin-bottom: 20px; text-align: center;">منصة ريتات للتسويق العقاري</h1>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            مرحباً،
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            شكراً لتسجيلك في منصة ريتات. لإكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:
          </p>
          
          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">رمز التحقق الخاص بك:</p>
            <p style="color: #f59e0b; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px;">${otpCode}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذه الرسالة.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © 2026 منصة ريتات - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
