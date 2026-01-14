import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "@/lib/email-otp";

export async function POST(req: Request) {
  try {
    const { name, companyName, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { error: "يوجد حساب مسبق بهذا البريد الإلكتروني." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // توليد رمز OTP مكون من 4 أرقام
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

    const user = await prisma.user.create({
      data: {
        name,
        companyName: companyName || null,
        email,
        phone: phone || null,
        passwordHash,
        emailVerified: false,
        otpCode,
        otpExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // إرسال رمز OTP عبر البريد الإلكتروني
    const hasGmailCredentials = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    
    if (hasGmailCredentials) {
      try {
        await sendOTPEmail(email, otpCode);
        return NextResponse.json(
          {
            message: "تم إنشاء الحساب بنجاح! تم إرسال رمز التحقق إلى بريدك الإلكتروني.",
            userId: user.id,
            email: user.email,
            requiresOTP: true,
          },
          { status: 201 }
        );
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        await prisma.user.delete({ where: { id: user.id } });
        return NextResponse.json(
          { error: "فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً." },
          { status: 500 }
        );
      }
    } else {
      // إذا لم تكن بيانات Gmail موجودة، فعّل الحساب مباشرة (للتطوير فقط)
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
      });

      const response = NextResponse.json(
        {
          message: "تم إنشاء الحساب بنجاح! (تم تفعيل الحساب تلقائياً - يرجى إضافة بيانات Gmail لتفعيل التحقق بالبريد)",
          userId: user.id,
          email: user.email,
          requiresOTP: false,
        },
        { status: 201 }
      );

      response.cookies.set("userId", String(user.id), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
