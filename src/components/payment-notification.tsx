"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PaymentNotificationProps {
  status?: string;
  credits?: string;
}

export function PaymentNotification({ status, credits }: PaymentNotificationProps) {
  const router = useRouter();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setShow(false);
        router.replace("/dashboard");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (!status || !show) return null;

  if (status === "success") {
    return (
      <div className="mb-6 p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/30">
        <p className="text-sm text-emerald-200 text-center font-semibold">
          ✅ تم الدفع بنجاح!
        </p>
        <p className="text-xs text-emerald-300 text-center mt-1">
          تم إضافة {credits || "0"} رصيد إعلان إلى حسابك.
        </p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mb-6 p-4 rounded-xl bg-rose-900/30 border border-rose-500/30">
        <p className="text-sm text-rose-200 text-center font-semibold">
          ❌ فشلت عملية الدفع
        </p>
        <p className="text-xs text-rose-300 text-center mt-1">
          لم يتم إتمام عملية الدفع. يرجى المحاولة مرة أخرى.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-6 p-4 rounded-xl bg-amber-900/30 border border-amber-500/30">
        <p className="text-sm text-amber-200 text-center font-semibold">
          ⚠️ حدث خطأ
        </p>
        <p className="text-xs text-amber-300 text-center mt-1">
          حدث خطأ أثناء معالجة الدفع. يرجى التواصل مع الدعم إذا استمرت المشكلة.
        </p>
      </div>
    );
  }

  return null;
}
