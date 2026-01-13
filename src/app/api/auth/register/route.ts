import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

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

    const hasEmailVerificationConfig =
      !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;

    if (!hasEmailVerificationConfig) {
      const user = await prisma.user.create({
        data: {
          name,
          companyName: companyName || null,
          email,
          phone: phone || null,
          passwordHash,
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiresAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionPlan: true,
        },
      });

      const response = NextResponse.json(user, { status: 201 });
      response.cookies.set("userId", String(user.id), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.user.create({
      data: {
        name,
        companyName: companyName || null,
        email,
        phone: phone || null,
        passwordHash,
        emailVerified: false,
        verificationToken: token,
        verificationTokenExpiresAt: expiresAt,
      },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        message:
          "تم إنشاء الحساب. تم إرسال رابط تفعيل إلى بريدك الإلكتروني، يرجى تفعيل الحساب قبل تسجيل الدخول.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
