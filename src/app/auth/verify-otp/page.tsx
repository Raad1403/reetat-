"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      router.push("/auth/register");
    }
  }, [email, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otpCode.trim()) {
      setError("يرجى إدخال رمز التحقق.");
      return;
    }

    if (otpCode.trim().length !== 4) {
      setError("رمز التحقق يجب أن يكون 4 أرقام.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otpCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "فشل التحقق من الرمز.");
        return;
      }

      setSuccess(data?.message || "تم تفعيل حسابك بنجاح!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError("حدث خطأ غير متوقع، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-6 md:p-8 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-50 mb-2">
            تحقق من بريدك الإلكتروني
          </h1>
          <p className="text-sm text-slate-300">
            تم إرسال رمز التحقق المكون من 4 أرقام إلى:
          </p>
          <p className="text-amber-400 font-medium mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otpCode" className="block text-sm font-medium text-slate-200 mb-2">
              رمز التحقق
            </label>
            <input
              id="otpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-slate-100 text-center text-2xl font-bold tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              placeholder="••••"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400 font-medium text-center">{error}</p>
          )}

          {success && (
            <p className="text-sm text-emerald-400 font-medium text-center">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 px-4 py-3 text-slate-950 font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "جاري التحقق..." : "تحقق من الرمز"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            لم يصلك الرمز؟{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              سجّل مرة أخرى
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="text-slate-300">جاري التحميل...</div>
      </main>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
