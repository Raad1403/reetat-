import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("id");
    const status = searchParams.get("status");

    if (!paymentId) {
      return NextResponse.redirect(
        new URL("/dashboard?payment=error", req.url)
      );
    }

    const moyasarResponse = await fetch(
      `https://api.moyasar.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.MOYASAR_SECRET_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );

    if (!moyasarResponse.ok) {
      console.error("Failed to verify payment with Moyasar");
      return NextResponse.redirect(
        new URL("/dashboard?payment=error", req.url)
      );
    }

    const payment = await moyasarResponse.json();

    if (payment.status !== "paid") {
      return NextResponse.redirect(
        new URL("/dashboard?payment=failed", req.url)
      );
    }

    const userId = parseInt(payment.metadata?.userId || "0");
    const credits = parseInt(payment.metadata?.credits || "0");

    if (!userId || !credits) {
      console.error("Invalid metadata in payment:", payment.metadata);
      return NextResponse.redirect(
        new URL("/dashboard?payment=error", req.url)
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        adCredits: {
          increment: credits,
        },
      },
    });

    return NextResponse.redirect(
      new URL(`/dashboard?payment=success&credits=${credits}`, req.url)
    );
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?payment=error", req.url)
    );
  }
}
