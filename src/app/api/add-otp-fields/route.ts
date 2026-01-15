import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key !== "reset-reetat-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = [];

    // إضافة حقول OTP بدون حذف البيانات الموجودة
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "otpCode" TEXT,
        ADD COLUMN IF NOT EXISTS "otpExpiresAt" TIMESTAMP
      `;
      results.push("✅ Added otpCode and otpExpiresAt columns");
    } catch (e: any) {
      results.push(`⚠️ Add columns: ${e.message}`);
    }

    // تحديث المستخدمين الحاليين ليكونوا مفعّلين (لأنهم سجلوا قبل OTP)
    try {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET "emailVerified" = true 
        WHERE "emailVerified" = false OR "emailVerified" IS NULL
      `;
      results.push("✅ Verified existing users");
    } catch (e: any) {
      results.push(`⚠️ Update users: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "OTP fields added successfully!",
      results: results,
      note: "Existing users are verified. New registrations will require OTP.",
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
