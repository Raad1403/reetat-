"use client";

import { useState } from "react";

interface PurchasePackageButtonProps {
  credits: 10 | 50 | 100;
  label: string;
  variant?: "primary" | "outline";
}

export function PurchasePackageButton({ credits, label, variant = "primary" }: PurchasePackageButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/billing/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credits }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.status === 401) {
        setError(data?.error || "يجب تسجيل الدخول أولاً قبل شراء رصيد إعلانات.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data?.error || "تعذّر إنشاء جلسة الدفع، حاول مرة أخرى.");
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError("فشل الحصول على رابط الدفع، حاول مرة أخرى.");
        setLoading(false);
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء تنفيذ العملية، حاول مرة أخرى.");
      setLoading(false);
    }
  }

  const baseClasses =
    "w-full inline-flex justify-center items-center rounded-xl px-4 py-2 text-xs font-semibold transition-all";

  const variantClasses =
    variant === "primary"
      ? "bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400"
      : "border border-slate-600/70 bg-slate-950/40 text-slate-100 hover:bg-slate-900/80";

  return (
    <div className="space-y-1 text-right">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${baseClasses} ${variantClasses} disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading ? "جاري معالجة الطلب..." : label}
      </button>
      {error && <p className="text-[11px] text-rose-300">{error}</p>}
      {success && !error && <p className="text-[11px] text-emerald-300">{success}</p>}
    </div>
  );
}
