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

    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "otpCode" TEXT,
        ADD COLUMN IF NOT EXISTS "otpExpiresAt" TIMESTAMP,
        ALTER COLUMN "emailVerified" SET DEFAULT false
      `;
      results.push("✅ Added OTP columns to User table");
    } catch (e: any) {
      results.push(`⚠️ User table update: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Schema updated successfully!",
      results: results,
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
