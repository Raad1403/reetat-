"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectLogoSectionProps {
  projectId: number;
  mainLogoUrl: string | null;
  initialLogos?: string[];
}

export function ProjectLogoSection({ projectId, mainLogoUrl, initialLogos = [] }: ProjectLogoSectionProps) {
  const router = useRouter();
  const [logos, setLogos] = useState<string[]>(initialLogos);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [currentMainLogoUrl, setCurrentMainLogoUrl] = useState<string | null>(
    mainLogoUrl || null
  );
  const [settingMainFor, setSettingMainFor] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/logo/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim() || undefined,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.status === 402) {
        setError(
          data?.error ||
            "لا يوجد لديك رصيد إعلانات كافٍ لتوليد محتوى جديد. قم بشراء حزمة من صفحة التسعير."
        );
        return;
      }

      if (!res.ok) {
        setError(data?.error || "فشل توليد الشعارات، حاول مرة أخرى.");
        return;
      }

      const newLogos = (data.logos as string[] | undefined) || [];
      if (newLogos.length > 0) {
        setLogos((prev) => [...newLogos, ...prev]);
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء توليد الشعارات.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSetMain(logoUrl: string) {
    setError(null);
    setSettingMainFor(logoUrl);

    try {
      const res = await fetch(`/api/projects/${projectId}/logo/main`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoUrl }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data?.error || "تعذّر حفظ الشعار الرئيسي، حاول مرة أخرى.");
        return;
      }

      setCurrentMainLogoUrl(logoUrl);
      router.refresh();
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء حفظ الشعار الرئيسي.");
    } finally {
      setSettingMainFor(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-50 text-lg">
            شعارات مقترحة وهوية بصرية (تجريبي)
          </h2>
          <p className="text-xs md:text-sm text-slate-300">
            يمكنك توليد شعارات أولية لمشروعك بالذكاء الاصطناعي لاستخدامها كنقطة بداية مع المصمم
            أو للفكرة الداخلية للفريق التسويقي.
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            يمكنك كتابة وصف مخصص لطريقة الشعار أو الألوان المطلوبة (اختياري)، ثم اختيار الشعار الأنسب
            وتعيينه كشعار رئيسي يظهر أعلى صفحة المشروع.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="mt-2 w-full md:w-72 rounded-xl border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/70"
            placeholder="مثال: شعار بسيط بحرف (ر) باللون الذهبي وخلفية كحلية داكنة."
          />
          {currentMainLogoUrl && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-amber-400/60 bg-slate-950/60 flex items-center justify-center">
                <img
                  src={currentMainLogoUrl}
                  alt="الشعار الرئيسي للمشروع"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-300">
                هذا هو الشعار الرئيسي الحالي للمشروع، وسيتم استخدامه كمرجع بصري في باقي المنصّة لاحقًا.
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? "جاري توليد الشعارات..." : "توليد شعارات مقترحة بالذكاء الاصطناعي"}
        </button>
      </div>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      {logos.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <p className="text-sm font-medium text-slate-200">
            الشعارات الناتجة (استخدمها كنقطة بداية، وليست بديلًا عن العمل مع مصمم محترف)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {logos.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-950/40 flex flex-col items-center justify-between p-3 gap-2"
              >
                <div className="w-full flex-1 flex items-center justify-center">
                  <img
                    src={src}
                    alt="شعار مقترح للمشروع"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSetMain(src)}
                  disabled={settingMainFor === src}
                  className="mt-1 w-full rounded-lg border border-amber-500/60 px-2 py-1 text-[11px] font-medium text-amber-100 hover:bg-amber-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {currentMainLogoUrl === src
                    ? "الشعار الرئيسي الحالي"
                    : settingMainFor === src
                    ? "جاري الحفظ..."
                    : "تعيين كشعار رئيسي للمشروع"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
