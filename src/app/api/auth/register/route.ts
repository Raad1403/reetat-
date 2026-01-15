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
    
    // التحقق من وجود Gmail credentials
    const hasEmailConfig = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    
    let otpCode: string | null = null;
    let otpExpiresAt: Date | null = null;
    let emailVerified = true; // افتراضياً مفعّل
    let requiresOTP = false;

    if (hasEmailConfig) {
      otpCode = generateOTP();
      otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      emailVerified = false;
      requiresOTP = true;
    }

    const user = await prisma.user.create({
      data: {
        name,
        companyName: companyName || null,
        email,
        phone: phone || null,
        passwordHash,
        emailVerified,
        otpCode,
        otpExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (hasEmailConfig && otpCode) {
      try {
        await sendOTPEmail(email, otpCode);
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        // لا نحذف المستخدم، بل نفعّل حسابه مباشرة
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            otpCode: null,
            otpExpiresAt: null,
          },
        });
        requiresOTP = false;
      }
    }

    if (requiresOTP) {
      return NextResponse.json(
        {
          message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.",
          userId: user.id,
          email: user.email,
          requiresOTP: true,
        },
        { status: 201 }
      );
    }

    // إذا لم يكن هناك OTP، نسجّل دخول المستخدم مباشرة
    const response = NextResponse.json(
      {
        message: "تم إنشاء الحساب بنجاح! جاري تحويلك إلى لوحة التحكم...",
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
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
