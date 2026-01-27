"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error || "تعذر تسجيل الدخول، تأكد من البيانات وحاول مرة أخرى."
        );
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError("حدث خطأ غير متوقع، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-8 space-y-6 shadow-[0_22px_70px_rgba(15,23,42,0.9)]">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-50">تسجيل الدخول</h1>
        <p className="text-center text-sm text-slate-300 mb-4">
          دخول المطورين العقاريين إلى لوحة التحكم.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">
              كلمة المرور
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "جاري تسجيل الدخول..." : "دخول"}
          </button>
          {error && (
            <p className="text-xs text-red-300 text-center mt-2">{error}</p>
          )}
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          لا تملك حسابًا؟{" "}
          <a
            href="/auth/register"
            className="text-amber-300 font-semibold hover:text-amber-200"
          >
            أنشئ حساب مطوّر جديد
          </a>
        </p>
      </div>
    </main>
  );
}
