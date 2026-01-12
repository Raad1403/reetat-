import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/logout-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "ريتات – ذكاء تسويقي لمشاريعك العقارية",
  description:
    "منصّة ريتات هي مساعدك الذكي لتسويق المشاريع العقارية في السعودية والخليج: توليد إعلانات نصية، صور، وشعارات وهوية بصرية بضغطة زر.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;
  const isLoggedIn = Boolean(userId);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 text-xs font-extrabold shadow-[0_10px_30px_rgba(251,191,36,0.55)]">
                  ر
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold leading-tight text-slate-50">
                    ريتات
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    ذكاء تسويقي لمشاريعك العقارية
                  </p>
                </div>
              </div>
              <nav className="flex items-center gap-4 text-xs md:text-sm text-slate-200">
                <Link
                  href="/"
                  className="rounded-full px-3 py-1 hover:bg-slate-900/70 transition-colors"
                >
                  الرئيسية
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full px-3 py-1 hover:bg-slate-900/70 transition-colors"
                >
                  الباقات والأسعار
                </Link>
                {isLoggedIn && (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-full px-3 py-1 hover:bg-slate-900/70 transition-colors"
                    >
                      لوحة التحكم
                    </Link>
                    <LogoutButton />
                  </>
                )}
                {!isLoggedIn && (
                  <Link
                    href="/auth/login"
                    className="rounded-full border border-slate-600/80 bg-slate-950/40 px-3 py-1 text-amber-200 hover:border-amber-400/80 hover:text-amber-100 transition-colors"
                  >
                    دخول المطوّرين
                  </Link>
                )}
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
