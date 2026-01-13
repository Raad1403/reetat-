"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PaymentVerifier() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const invoiceId = searchParams.get("invoice_id");
    const paymentStatus = searchParams.get("payment");

    if (invoiceId && !paymentStatus && !verifying) {
      setVerifying(true);
      verifyPayment(invoiceId);
    }
  }, [searchParams, verifying]);

  async function verifyPayment(invoiceId: string) {
    try {
      const res = await fetch("/api/billing/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.replace(`/dashboard?payment=success&credits=${data.credits}`);
        router.refresh();
      } else {
        router.replace("/dashboard?payment=error");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      router.replace("/dashboard?payment=error");
    }
  }

  if (verifying) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-blue-900/30 border border-blue-500/30">
        <p className="text-sm text-blue-200 text-center">
          جاري التحقق من الدفع...
        </p>
      </div>
    );
  }

  return null;
}
