import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "معرف الفاتورة مطلوب" },
        { status: 400 }
      );
    }

    const moyasarResponse = await fetch(
      `https://api.moyasar.com/v1/invoices/${invoiceId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.MOYASAR_SECRET_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );

    if (!moyasarResponse.ok) {
      console.error("Failed to verify invoice with Moyasar");
      return NextResponse.json(
        { error: "فشل التحقق من الدفع" },
        { status: 500 }
      );
    }

    const invoice = await moyasarResponse.json();

    if (invoice.status !== "paid") {
      return NextResponse.json(
        { error: "الدفع غير مكتمل", status: invoice.status },
        { status: 400 }
      );
    }

    const metadataUserId = parseInt(invoice.metadata?.userId || "0");
    const credits = parseInt(invoice.metadata?.credits || "0");

    if (metadataUserId !== parseInt(userId)) {
      return NextResponse.json(
        { error: "معرف المستخدم غير متطابق" },
        { status: 403 }
      );
    }

    if (!credits) {
      return NextResponse.json(
        { error: "بيانات الفاتورة غير صحيحة" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        adCredits: {
          increment: credits,
        },
      },
      select: { id: true, adCredits: true },
    });

    return NextResponse.json({
      success: true,
      credits,
      newBalance: updatedUser.adCredits,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من الدفع" },
      { status: 500 }
    );
  }
}
