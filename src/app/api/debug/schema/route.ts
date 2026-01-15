import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // محاولة جلب مستخدم واحد لفحص الـ schema
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // محاولة إنشاء مستخدم تجريبي
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      const newUser = await prisma.user.create({
        data: {
          name: "Test User",
          email: testEmail,
          passwordHash: "test123",
          emailVerified: true,
        },
      });

      // حذف المستخدم التجريبي
      await prisma.user.delete({
        where: { id: newUser.id },
      });

      return NextResponse.json({
        status: "success",
        message: "Database schema is correct",
        sampleUser: user,
        testCreate: "passed",
      });
    } catch (createError: any) {
      return NextResponse.json({
        status: "error",
        message: "Failed to create test user",
        error: createError.message,
        sampleUser: user,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "Database connection or schema error",
      error: error.message,
    });
  }
}
