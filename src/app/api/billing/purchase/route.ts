import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          error: "يجب تسجيل الدخول أولاً قبل شراء رصيد إعلانات.",
        },
        { status: 401 }
      );
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }

    const credits = Number(body?.credits ?? 0);

    const allowedPackages = [10, 50, 100];
    if (!allowedPackages.includes(credits)) {
      return NextResponse.json(
        {
          error: "حزمة الإعلانات غير معروفة. يرجى اختيار إحدى الحزم الظاهرة في صفحة التسعير.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        adCredits: {
          increment: credits,
        },
      },
      select: {
        adCredits: true,
      },
    });

    return NextResponse.json(
      {
        adCredits: user.adCredits,
        message: `تم إضافة ${credits} رصيد إعلان إلى حسابك. يمكنك رؤية الرصيد في لوحة التحكم.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Billing purchase error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة طلب شراء الحزمة، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
