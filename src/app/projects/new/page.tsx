"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const title = (formData.get("projectName") as string | null)?.trim() ?? "";
      const city = (formData.get("city") as string | null)?.trim() ?? "";
      const status = (formData.get("status") as string | null)?.trim() ?? "على المخطط";
      const features = (formData.get("features") as string | null)?.trim() ?? "";

      if (!title && !city) {
        setError("يرجى إدخال اسم للمشروع أو مدينة على الأقل.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          city,
          status,
          description: features,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "تعذر إنشاء المشروع، حاول مرة أخرى.");
        setLoading(false);
        return;
      }

      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError("حدث خطأ غير متوقع، حاول مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-50">إنشاء مشروع تطوير عقاري جديد</h1>
      <p className="text-sm text-slate-300 mb-6">
        أدخل بيانات مشروعك، وسنقوم بتوليد إعلان ومحتوى تسويقي متكامل خلال ثوانٍ.
      </p>

      <form
        className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-6 shadow-[0_22px_70px_rgba(15,23,42,0.85)]"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">اسم المشروع (إن وجد)</label>
            <input
              type="text"
              name="projectName"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">نوع المشروع</label>
            <select className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80">
              <option>فلل</option>
              <option>شقق</option>
              <option>مخطط أراضٍ</option>
              <option>عمارة</option>
              <option>مجمع سكني</option>
              <option>تجاري</option>
            </select>
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">المدينة</label>
            <input
              type="text"
              name="city"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">الحي</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">المساحة الإجمالية للمشروع</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              placeholder="مثال: 10,000 م²"
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">عدد الوحدات</label>
            <input
              type="number"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              placeholder="مثال: 24 فيلا أو 80 شقة"
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">نطاق الأسعار (من)</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              placeholder="مثال: 800,000 ريال"
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">نطاق الأسعار (إلى)</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
              placeholder="مثال: 1,200,000 ريال"
            />
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">حالة المشروع</label>
            <select
              name="status"
              className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
            >
              <option>على المخطط</option>
              <option>تحت الإنشاء</option>
              <option>جاهز</option>
            </select>
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">الفئة المستهدفة</label>
            <select className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80">
              <option>عائلات</option>
              <option>مستثمرون</option>
              <option>عرسان</option>
              <option>أصحاب الدخل العالي</option>
              <option>متوسطو الدخل</option>
            </select>
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">طابع المشروع</label>
            <select className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80">
              <option>فخم</option>
              <option>اقتصادي</option>
              <option>عائلي</option>
              <option>شبابي</option>
              <option>عصري</option>
              <option>تراثي</option>
            </select>
          </div>
          <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-200">هدف الحملة</label>
            <select className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80">
              <option>البيع المباشر</option>
              <option>الحجز المبدئي</option>
              <option>التأجير</option>
              <option>جمع العملاء المهتمين (Leads)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1 text-right">
          <label className="block text-sm font-medium text-slate-200">المميزات (اكتبها بحرية)</label>
          <textarea
            rows={4}
            name="features"
            className="w-full rounded-xl border border-slate-600/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-400/80"
            placeholder="مثال: قرب من الخدمات، تشطيب فاخر، ضمانات على الهيكل والسباكة والكهرباء..."
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-slate-600/70 text-sm text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            إلغاء
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "جاري إنشاء المشروع..." : "توليد المحتوى بالذكاء الاصطناعي"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-300 text-center">{error}</p>
        )}
      </form>
    </main>
  );
}
