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
        name: true,
        email: true,
        otpCode: true,
        otpExpiresAt: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير مسجل." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مفعّل بالفعل." },
        { status: 400 }
      );
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { error: "لا يوجد رمز تحقق نشط. يرجى طلب رمز جديد." },
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json(
        { error: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد." },
        { status: 400 }
      );
    }

    if (user.otpCode !== otpCode.trim()) {
      return NextResponse.json(
        { error: "رمز التحقق غير صحيح." },
        { status: 400 }
      );
    }

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
        message: "تم تفعيل حسابك بنجاح! جاري تحويلك إلى لوحة التحكم...",
        userId: user.id,
      },
      { status: 200 }
    );

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من الرمز، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
