"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GenerateContentButtonProps {
  projectId: number;
  hasContent: boolean;
}

export function GenerateContentButton({
  projectId,
  hasContent,
}: GenerateContentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.status === 402) {
        setError(
          data?.error ||
            "لا يوجد لديك رصيد إعلانات كافٍ لتوليد محتوى جديد. قم بشراء حزمة من صفحة التسعير."
        );
        return;
      }

      if (!res.ok) {
        setError(data?.error || "تعذر توليد المحتوى، حاول مرة أخرى.");
        return;
      }

      router.refresh();
    } catch (err) {
      setError("حدث خطأ غير متوقع، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-xs md:text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "جاري توليد المحتوى..."
          : hasContent
          ? "إعادة توليد المحتوى"
          : "توليد المحتوى الآن"}
      </button>
      {error && (
        <p className="text-[11px] text-red-300 text-right max-w-xs">{error}</p>
      )}
      {hasContent && !loading && !error && (
        <p className="text-[11px] text-slate-400 text-right max-w-xs">
          تم توليد المحتوى لهذا المشروع، يمكنك إعادة توليده في أي وقت لتحسين النصوص.
        </p>
      )}
    </div>
  );
}
