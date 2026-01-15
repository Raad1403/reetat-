"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) {
      setError("الاسم والبريد الإلكتروني وكلمة المرور مطلوبة.");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتان.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          companyName: companyName || undefined,
          email,
          phone: phone || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "تعذر إنشاء الحساب، حاول مرة أخرى.");
        return;
      }

      setSuccess(data?.message || "تم إنشاء الحساب بنجاح!");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError("حدث خطأ غير متوقع، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-8 space-y-6 shadow-[0_22px_70px_rgba(15,23,42,0.9)]">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-50">
          إنشاء حساب مطوّر عقاري
        </h1>
        <p className="text-center text-sm text-slate-300 mb-4">
          سجّل بياناتك للوصول إلى لوحة التحكم وإنشاء مشاريعك التطويرية.
        </p>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">الاسم الكامل</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">اسم الشركة (اختياري)</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">رقم الجوال</label>
            <input
              type="tel"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">كلمة المرور</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">تأكيد كلمة المرور</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
            {error && (
              <p className="mt-2 text-xs text-red-300 text-center">{error}</p>
            )}
            {success && !error && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/30">
                <p className="text-sm text-emerald-200 text-center">{success}</p>
              </div>
            )}
          </div>
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          لديك حساب مسبقًا؟{" "}
          <a
            href="/auth/login"
            className="text-amber-300 font-semibold hover:text-amber-200"
          >
            تسجيل الدخول
          </a>
        </p>
      </div>
    </main>
  );
}
