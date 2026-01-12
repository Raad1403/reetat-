"use client";

import { useState } from "react";

interface ShareProjectButtonProps {
  projectId: number;
  initialPublicId?: string | null;
}

export function ShareProjectButton({ projectId, initialPublicId }: ShareProjectButtonProps) {
  const [publicId, setPublicId] = useState<string | null>(initialPublicId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setCopied(false);
    setIsLoading(true);

    try {
      let currentPublicId = publicId;

      // إذا لم يكن هناك publicId بعد، نطلب إنشاءه من الخادم
      if (!currentPublicId) {
        const res = await fetch(`/api/projects/${projectId}/publish`, {
          method: "POST",
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok || !data?.publicId) {
          throw new Error(
            data?.error || "تعذّر إنشاء رابط العرض للمشروع، حاول مرة أخرى."
          );
        }

        currentPublicId = data.publicId as string;
        setPublicId(currentPublicId);
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const shareUrl = `${origin}/p/${currentPublicId}`;

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "حدث خطأ غير متوقع أثناء تجهيز رابط العرض.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const label = isLoading
    ? "جاري تجهيز رابط العرض..."
    : publicId
    ? "نسخ رابط عرض المشروع"
    : "إنشاء رابط عرض للمشروع";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="px-3 py-2 rounded-xl border border-slate-600/70 bg-slate-900/60 text-xs md:text-sm text-slate-100 hover:bg-slate-800/80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {label}
      </button>
      {copied && (
        <span className="text-[11px] text-emerald-400 font-medium">
          تم نسخ رابط العرض للحافظة.
        </span>
      )}
      {error && (
        <span className="text-[11px] text-rose-400 font-medium max-w-xs text-right">
          {error}
        </span>
      )}
    </div>
  );
}
