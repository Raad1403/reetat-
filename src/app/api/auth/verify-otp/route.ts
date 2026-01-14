import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: "البريد الإلكتروني ورمز التحقق مطلوبان." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        otpCode: true,
        otpExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب بهذا البريد الإلكتروني." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "تم التحقق من هذا الحساب مسبقاً." },
        { status: 400 }
      );
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { error: "لم يتم إرسال رمز تحقق لهذا الحساب." },
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json(
        { error: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد." },
        { status: 400 }
      );
    }

    if (user.otpCode !== otpCode) {
      return NextResponse.json(
        { error: "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى." },
        { status: 400 }
      );
    }

    // تحديث المستخدم وتفعيل الحساب
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const response = NextResponse.json(
      {
        message: "تم التحقق من بريدك الإلكتروني بنجاح!",
        success: true,
      },
      { status: 200 }
    );

    // تسجيل دخول المستخدم تلقائياً
    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من الرمز، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
