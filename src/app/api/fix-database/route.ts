import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    
    // مفتاح بسيط للحماية
    if (key !== "fix-reetat-db-2026") {
      return NextResponse.json(
        { error: "Unauthorized - Invalid key" },
        { status: 401 }
      );
    }

    const results = [];

    // 1. حذف الأعمدة القديمة إذا كانت موجودة
    try {
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "otpCode"`;
      results.push("✅ Dropped otpCode column");
    } catch (e: any) {
      results.push(`⚠️ otpCode: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "otpExpiresAt"`;
      results.push("✅ Dropped otpExpiresAt column");
    } catch (e: any) {
      results.push(`⚠️ otpExpiresAt: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "verificationToken"`;
      results.push("✅ Dropped verificationToken column");
    } catch (e: any) {
      results.push(`⚠️ verificationToken: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "verificationTokenExpiresAt"`;
      results.push("✅ Dropped verificationTokenExpiresAt column");
    } catch (e: any) {
      results.push(`⚠️ verificationTokenExpiresAt: ${e.message}`);
    }

    // 2. تحديث جميع المستخدمين ليكونوا مفعّلين
    try {
      const updateCount = await prisma.$executeRaw`
        UPDATE "User" SET "emailVerified" = true 
        WHERE "emailVerified" = false OR "emailVerified" IS NULL
      `;
      results.push(`✅ Updated ${updateCount} users to verified`);
    } catch (e: any) {
      results.push(`⚠️ Update users: ${e.message}`);
    }

    // 3. تعيين القيمة الافتراضية
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT true`;
      results.push("✅ Set emailVerified default to true");
    } catch (e: any) {
      results.push(`⚠️ Set default: ${e.message}`);
    }

    // 4. اختبار إنشاء مستخدم جديد
    const testEmail = `test-${Date.now()}@example.com`;
    try {
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

      results.push("✅ Test user creation: SUCCESS");
    } catch (e: any) {
      results.push(`❌ Test user creation failed: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Database fix completed!",
      results: results,
      nextStep: "Now try registering at https://reetat.com/auth/register",
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 500),
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
