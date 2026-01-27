import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const totalUsers = await prisma.user.count();
    
    const verifiedUsers = await prisma.user.count({
      where: { emailVerified: true }
    });
    
    const unverifiedUsers = await prisma.user.count({
      where: { emailVerified: false }
    });

    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const totalProjects = await prisma.project.count();

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      totalProjects,
      recentUsers,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإحصائيات" },
      { status: 500 }
    );
  }
}
