"use client";

import { useState, ChangeEvent } from "react";

interface ProjectImagesSectionProps {
  projectId: number;
  initialImages?: string[];
}

export function ProjectImagesSection({ projectId, initialImages = [] }: ProjectImagesSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>(initialImages);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile) {
      setError("الرجاء اختيار صورة أولاً.");
      return;
    }

    setError(null);
    setIsEnhancing(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      if (enhancePrompt.trim()) {
        formData.append("prompt", enhancePrompt.trim());
      }

      const response = await fetch(`/api/projects/${projectId}/images/enhance`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل تحسين الصورة.");
      }

      const enhanced = data.imageBase64 as string | undefined;
      if (enhanced) {
        setGeneratedImages((prev) => [enhanced, ...prev]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء تحسين الصورة.";
      setError(message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/images/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل توليد الصور.");
      }

      const images = (data.images as string[] | undefined) || [];
      if (images.length > 0) {
        setGeneratedImages((prev) => [...images, ...prev]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء توليد الصور.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-50 text-lg">الصور والهوية البصرية للمشروع</h2>
          <p className="text-xs md:text-sm text-slate-300">
            يمكنك رفع صور حقيقية لمشروعك لتحسينها بالذكاء الاصطناعي، أو توليد صور واقعية للمشروع إذا لم تكن لديك صور جاهزة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-200">1. رفع صورة وتحسينها</p>
          <label className="block border border-dashed border-slate-700/80 rounded-2xl p-4 cursor-pointer bg-slate-950/30 hover:bg-slate-900/60 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-l from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_14px_40px_rgba(251,191,36,0.6)]">
                +
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-50">اختر صورة من جهازك</p>
                <p className="text-xs text-slate-400">PNG أو JPG حتى 5 ميجابايت تقريبًا.</p>
              </div>
            </div>
          </label>

          {previewUrl && (
            <div className="space-y-2">
              <p className="text-xs text-slate-300">معاينة الصورة الأصلية:</p>
              <div className="rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-950/40">
                <img src={previewUrl} alt="الصورة الأصلية" className="w-full h-auto object-cover" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs text-slate-300">
              وصف التحسين المطلوب (اختياري):
            </label>
            <textarea
              value={enhancePrompt}
              onChange={(e) => setEnhancePrompt(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/70"
              placeholder="مثال: أضف أشجار حول المبنى، أو حسّن الإضاءة وزد الوضوح، أو أضف سماء زرقاء صافية..."
            />
          </div>

          <button
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing || !selectedFile}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isEnhancing ? "جاري تحسين الصورة..." : "تحسين الصورة بالذكاء الاصطناعي"}
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-200">2. توليد صور للمشروع تلقائيًا</p>
          <p className="text-xs text-slate-400">
            إذا لم تكن لديك صور جاهزة، يمكن للمنصّة توليد صور واقعية مستوحاة من اسم المشروع والمدينة والوصف الذي أدخلته.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="w-full md:w-80 rounded-xl border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400/70"
            placeholder="اكتب هنا وصفًا إضافيًا لنوع الصور المطلوبة (مثال: صور ليلية للواجهات مع إضاءة دافئة وحدائق)."
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-l from-sky-400 to-indigo-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(56,189,248,0.45)] hover:from-sky-300 hover:to-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? "جاري توليد الصور..." : "إنشاء صور للمشروع بالذكاء الاصطناعي"}
          </button>
          <p className="text-[11px] text-slate-400">
            ملاحظة: يتم حفظ الصور المولّدة مع هذا المشروع، ويمكنك العودة لها لاحقًا من نفس الصفحة.
          </p>
        </div>
      </div>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      {generatedImages.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <p className="text-sm font-medium text-slate-200">الصور الناتجة من الذكاء الاصطناعي</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {generatedImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-950/40"
              >
                <img src={src} alt="صورة مولدة بالذكاء الاصطناعي" className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
