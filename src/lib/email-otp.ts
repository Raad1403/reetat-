import nodemailer from "nodemailer";

export async function sendOTPEmail(email: string, otpCode: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"ريتات - منصة التسويق العقاري" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "رمز التحقق من البريد الإلكتروني - ريتات",
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: #1e293b;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content p {
            color: #475569;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .otp-box {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border: 2px solid #fbbf24;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #1e293b;
            letter-spacing: 12px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .expiry {
            color: #ef4444;
            font-size: 14px;
            margin-top: 15px;
            font-weight: 600;
          }
          .footer {
            background-color: #f8fafc;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            color: #94a3b8;
            font-size: 13px;
            margin: 5px 0;
          }
          .warning {
            background-color: #fef3c7;
            border-right: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
            text-align: right;
          }
          .warning p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 ريتات</h1>
          </div>
          <div class="content">
            <p>مرحباً بك في منصة ريتات للتسويق العقاري!</p>
            <p>لإتمام عملية التسجيل، يرجى إدخال رمز التحقق التالي:</p>
            
            <div class="otp-box">
              <div class="otp-label">رمز التحقق الخاص بك</div>
              <div class="otp-code">${otpCode}</div>
              <div class="expiry">⏱️ صالح لمدة 10 دقائق فقط</div>
            </div>

            <div class="warning">
              <p>⚠️ لا تشارك هذا الرمز مع أي شخص. فريق ريتات لن يطلب منك هذا الرمز أبداً.</p>
            </div>

            <p>إذا لم تقم بإنشاء حساب على ريتات، يرجى تجاهل هذه الرسالة.</p>
          </div>
          <div class="footer">
            <p>© 2026 ريتات - منصة التسويق العقاري بالذكاء الاصطناعي</p>
            <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
