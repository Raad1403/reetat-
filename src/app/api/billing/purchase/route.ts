import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const PACKAGE_PRICES: Record<number, number> = {
  10: 9900,
  50: 28900,
  100: 39900,
};

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

    if (!PACKAGE_PRICES[credits]) {
      return NextResponse.json(
        {
          error: "حزمة الإعلانات غير معروفة. يرجى اختيار إحدى الحزم الظاهرة في صفحة التسعير.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود." },
        { status: 404 }
      );
    }

    const amount = PACKAGE_PRICES[credits];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    if (!process.env.MOYASAR_SECRET_KEY) {
      console.error("MOYASAR_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "إعدادات الدفع غير مكتملة. يرجى التواصل مع الدعم." },
        { status: 500 }
      );
    }
    
    const invoiceData = {
      amount: amount,
      currency: "SAR",
      description: `شراء ${credits} رصيد إعلان - ريتات`,
      callback_url: `${baseUrl}/api/billing/callback`,
      success_url: `${baseUrl}/dashboard`,
      metadata: {
        userId: user.id.toString(),
        credits: credits.toString(),
        email: user.email,
      },
    };

    const moyasarResponse = await fetch("https://api.moyasar.com/v1/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.MOYASAR_SECRET_KEY + ":"
        ).toString("base64")}`,
      },
      body: JSON.stringify(invoiceData),
    });

    if (!moyasarResponse.ok) {
      const errorData = await moyasarResponse.json();
      console.error("Moyasar API error:", {
        status: moyasarResponse.status,
        statusText: moyasarResponse.statusText,
        error: errorData,
      });
      return NextResponse.json(
        { error: "فشل إنشاء جلسة الدفع، حاول مرة أخرى." },
        { status: 500 }
      );
    }

    const invoice = await moyasarResponse.json();

    return NextResponse.json(
      {
        invoiceId: invoice.id,
        checkoutUrl: invoice.url,
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
