"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        // في حال فشل تسجيل الخروج، نكمل إعادة التوجيه لتصفية الكوكي من جهة الخادم عند أول طلب
        console.error("Logout failed", await res.text().catch(() => ""));
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error", error);
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-[11px] md:text-xs text-slate-400 hover:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
    </button>
  );
}
