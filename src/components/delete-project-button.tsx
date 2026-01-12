"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteProjectButtonProps {
  projectId: number;
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا الإعلان؟ لن تتمكن من استعادته."
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(
          data?.error || "تعذّر حذف المشروع، حاول مرة أخرى."
        );
        return;
      }

      router.refresh();
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء الحذف.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="text-[11px] text-rose-300 hover:text-rose-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "جاري الحذف..." : "حذف الإعلان"}
      </button>
      {error && (
        <p className="text-[10px] text-rose-400 max-w-[180px]">{error}</p>
      )}
    </div>
  );
}
