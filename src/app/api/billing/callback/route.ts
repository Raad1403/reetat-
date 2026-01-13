import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoice_id") || searchParams.get("id");
    const status = searchParams.get("status");

    if (!invoiceId) {
      return NextResponse.redirect(
        new URL("/dashboard?payment=error", req.url)
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
      return NextResponse.redirect(
        new URL("/dashboard?payment=error", req.url)
      );
    }

    const invoice = await moyasarResponse.json();

    if (invoice.status !== "paid") {
      return NextResponse.redirect(
        new URL("/dashboard?payment=failed", req.url)
      );
    }

    const userId = parseInt(invoice.metadata?.userId || "0");
    const credits = parseInt(invoice.metadata?.credits || "0");

    if (!userId || !credits) {
      console.error("Invalid metadata in invoice:", invoice.metadata);
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
