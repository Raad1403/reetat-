import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTPEmail } from "@/lib/email-otp";

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
    const otpCode = generateOTP();
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

    try {
      await sendOTPEmail(email, otpCode);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: "فشل إرسال رمز التحقق. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.",
        userId: user.id,
        email: user.email,
        requiresOTP: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
