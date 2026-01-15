import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبة." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة." },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "يجب تفعيل البريد الإلكتروني قبل تسجيل الدخول. يرجى التحقق من بريدك الإلكتروني.",
        },
        { status: 403 }
      );
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionPlan: user.subscriptionPlan,
    };

    const response = NextResponse.json(userData, { status: 200 });
    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 يومًا
    });

    // لاحقًا يمكن تحويل هذا إلى جلسة أكثر تقدمًا (JWT أو مكتبة جاهزة)
    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
