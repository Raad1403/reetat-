"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOTPPage() {
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otpCode || otpCode.length !== 4) {
      setError("يرجى إدخال رمز التحقق المكون من 4 أرقام.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "فشل التحقق من الرمز، حاول مرة أخرى.");
        return;
      }

      setSuccess(data?.message || "تم التحقق بنجاح!");
      
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
      <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-8 space-y-6 shadow-[0_22px_70px_rgba(15,23,42,0.9)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-l from-amber-400 to-amber-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-50">
            تحقق من بريدك الإلكتروني
          </h1>
          <p className="text-sm text-slate-300 mb-2">
            تم إرسال رمز التحقق المكون من 4 أرقام إلى:
          </p>
          <p className="text-sm font-semibold text-amber-300 mb-4">
            {email}
          </p>
          <p className="text-xs text-slate-400">
            يرجى إدخال الرمز خلال 10 دقائق
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-slate-200">
              رمز التحقق (4 أرقام)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-4 py-3 text-center text-2xl font-bold tracking-widest text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              placeholder="••••"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setOtpCode(value);
              }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 4}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "جاري التحقق..." : "تحقق من الرمز"}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-900/30 border border-rose-500/30">
              <p className="text-sm text-rose-200 text-center">{error}</p>
            </div>
          )}

          {success && !error && (
            <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/30">
              <p className="text-sm text-emerald-200 text-center">{success}</p>
            </div>
          )}
        </form>

        <div className="text-center pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2">
            لم يصلك الرمز؟
          </p>
          <button
            type="button"
            className="text-xs text-amber-300 font-semibold hover:text-amber-200 transition-colors"
            onClick={() => {
              setError("يرجى الانتظار قليلاً ثم المحاولة مرة أخرى من صفحة التسجيل.");
            }}
          >
            إعادة إرسال الرمز
          </button>
        </div>
      </div>
    </main>
  );
}
