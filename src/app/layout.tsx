import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import GoogleAnalytics from "@/components/google-analytics";
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
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 antialiased relative">
        <GoogleAnalytics GA_MEASUREMENT_ID="G-XLQ2HHM8Y0" />
        <div 
          className="fixed inset-0 z-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'url(/logo.png)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '50%',
          }}
        />
        <div className="min-h-screen relative z-10">
          <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-xl px-4 py-2 border border-slate-700/50">
                  <Image 
                    src="/logo.png" 
                    alt="ريتات - Reetat" 
                    width={140} 
                    height={42}
                    className="h-10 w-auto opacity-90"
                    priority
                  />
                </div>
              </Link>
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
                <Link
                  href="/dashboard"
                  className="rounded-full px-3 py-1 hover:bg-slate-900/70 transition-colors"
                >
                  لوحة التحكم
                </Link>
                <LogoutButton />
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
