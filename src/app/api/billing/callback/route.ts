import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoice_id") || searchParams.get("id");
    const status = searchParams.get("status");

    console.log("Callback received:", { invoiceId, status, url: req.url });

    if (!invoiceId) {
      console.error("No invoice ID in callback");
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
      console.error("Failed to verify invoice with Moyasar:", moyasarResponse.status);
      return NextResponse.redirect(
        new URL("/dashboard?payment=error", req.url)
      );
    }

    const invoice = await moyasarResponse.json();
    console.log("Invoice retrieved:", { id: invoice.id, status: invoice.status, metadata: invoice.metadata });

    if (invoice.status !== "paid") {
      console.log("Invoice not paid, status:", invoice.status);
      return NextResponse.redirect(
        new URL("/dashboard?payment=failed", req.url)
      );
    }

    const userId = parseInt(invoice.metadata?.userId || "0");
    const credits = parseInt(invoice.metadata?.credits || "0");

    console.log("Parsed metadata:", { userId, credits });

    if (!userId || !credits) {
      console.error("Invalid metadata in invoice:", invoice.metadata);
      return NextResponse.redirect(
        new URL("/dashboard?payment=error", req.url)
      );
    }

    console.log("Updating user credits:", { userId, credits });
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        adCredits: {
          increment: credits,
        },
      },
      select: { id: true, adCredits: true },
    });

    console.log("User updated successfully:", updatedUser);

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
