import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // التحقق من وجود مفتاح أمان
    const { secret } = await req.json();
    
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // محاولة تحديث جميع المستخدمين الحاليين
    const updateResult = await prisma.$executeRaw`
      UPDATE "User" 
      SET "emailVerified" = true 
      WHERE "emailVerified" = false OR "emailVerified" IS NULL
    `;

    // محاولة حذف الأعمدة القديمة إذا كانت موجودة
    try {
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "otpCode"`;
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "otpExpiresAt"`;
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "verificationToken"`;
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "verificationTokenExpiresAt"`;
    } catch (alterError) {
      console.log("Columns might not exist, continuing...");
    }

    // اختبار إنشاء مستخدم جديد
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: testEmail,
        passwordHash: "test123",
        emailVerified: true,
      },
    });

    // حذف المستخدم التجريبي
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    return NextResponse.json({
      success: true,
      message: "Database fixed successfully",
      updatedUsers: updateResult,
      testUserCreated: true,
    });
  } catch (error: any) {
    console.error("Fix DB error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
}
