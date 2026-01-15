import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    const user = await prisma.user.create({
      data: {
        name,
        companyName: companyName || null,
        email,
        phone: phone || null,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const response = NextResponse.json(
      {
        message: "تم إنشاء الحساب بنجاح! جاري تحويلك إلى لوحة التحكم...",
        userId: user.id,
        email: user.email,
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
