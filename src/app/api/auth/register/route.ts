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

    try {
      // محاولة إنشاء المستخدم باستخدام Prisma مع تجاهل الأخطاء المتعلقة بالحقول الإضافية
      let user;
      
      try {
        // محاولة 1: استخدام Prisma ORM العادي
        user = await prisma.user.create({
          data: {
            name,
            companyName: companyName || null,
            email,
            phone: phone || null,
            passwordHash,
            emailVerified: true,
          } as any, // استخدام any لتجاوز مشاكل TypeScript
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
      } catch (prismaError: any) {
        // إذا فشل Prisma، استخدم raw SQL
        console.log("Prisma create failed, trying raw SQL:", prismaError.message);
        
        await prisma.$executeRaw`
          INSERT INTO "User" (
            name, 
            "companyName", 
            email, 
            phone, 
            "passwordHash", 
            "emailVerified",
            "subscriptionPlan",
            "adCredits",
            "usedTrialAds",
            "createdAt",
            "updatedAt"
          ) VALUES (
            ${name},
            ${companyName || null},
            ${email},
            ${phone || null},
            ${passwordHash},
            true,
            'FREE',
            0,
            0,
            NOW(),
            NOW()
          )
        `;

        // جلب المستخدم المُنشأ
        user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        if (!user) {
          throw new Error("Failed to retrieve created user after raw SQL insert");
        }
      }

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
    } catch (createError: any) {
      console.error("Prisma create user error:", createError);
      console.error("Error code:", createError.code);
      console.error("Error meta:", createError.meta);
      return NextResponse.json(
        {
          error: "حدث خطأ أثناء إنشاء الحساب في قاعدة البيانات.",
          errorMessage: createError.message,
          errorCode: createError.code,
          errorMeta: createError.meta,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Register error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى.",
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 200),
      },
      { status: 500 }
    );
  }
}
