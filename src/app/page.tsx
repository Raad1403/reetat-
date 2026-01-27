import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;
  const isLoggedIn = Boolean(userId);

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-20">
        <section className="grid gap-10 lg:grid-cols-[1.3fr,1fr] items-center">
          <div className="space-y-6 text-right">
            <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-[11px] font-semibold text-amber-200">
              ريتات – ذكاء تسويقي لمشاريعك العقارية
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
              حوّل مواصفات مشروعك التطويري
              <span className="block text-amber-300">إلى محتوى تسويقي جاهز خلال ثوانٍ</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl ml-auto">
              منصّة ريتات هي مساعدك الذكي لتسويق المشاريع العقارية في السعودية والخليج. أدخل بيانات
              مشروعك، واحصل على إعلان عقاري احترافي، محتوى سوشيال ميديا، رسائل واتساب، وأفكار
              شعارات وهوية؛ بدون كاتب محتوى وبدون وكالة تسويق.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 pt-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/projects/new"
                    className="inline-flex justify-center items-center px-7 py-3 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm md:text-base font-semibold shadow-[0_18px_60px_rgba(251,191,36,0.35)] hover:from-amber-300 hover:to-amber-400 transition-all duration-200"
                  >
                    ابدأ مشروعك الآن
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-slate-700/80 bg-slate-900/40 text-slate-100 text-sm md:text-base font-semibold hover:bg-slate-800/80 transition-colors"
                  >
                    الانتقال إلى لوحة التحكم
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="inline-flex justify-center items-center px-7 py-3 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm md:text-base font-semibold shadow-[0_18px_60px_rgba(251,191,36,0.35)] hover:from-amber-300 hover:to-amber-400 transition-all duration-200"
                  >
                    ابدأ مشروعك التجريبي مجانًا
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-slate-700/80 bg-slate-900/40 text-slate-100 text-sm md:text-base font-semibold hover:bg-slate-800/80 transition-colors"
                  >
                    تسجيل الدخول للمطوّرين
                  </Link>
                </>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-6 text-xs md:text-sm text-slate-400 pt-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                محتوى جاهز في أقل من 60 ثانية لكل مشروع
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                مصمم خصيصًا للسوق السعودي والخليجي
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-amber-500/25 via-slate-50/5 to-amber-400/10 blur-3xl" />
            <div className="relative rounded-3xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-xl px-6 py-6 md:px-8 md:py-7 shadow-[0_24px_80px_rgba(15,23,42,0.9)] space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-[11px] font-medium text-slate-400">مشروع تطويري تجريبي</p>
                  <p className="text-sm font-semibold text-slate-50 mt-1">مجمع فلل النخبة - الرياض</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-400/40">
                  المحتوى جاهز الآن
                </span>
              </div>

              <div className="space-y-3 text-right text-xs text-slate-200 bg-slate-900/60 rounded-2xl p-4 border border-slate-700/60">
                <p className="text-[11px] font-semibold text-amber-300">
                  نموذج إعلان عقاري رئيسي
                </p>
                <p>
                  اكتشف مشروع فلل عائلية فاخرة في موقع استراتيجي شمال الرياض، بتصاميم عصرية
                  ومساحات رحبة وتشطيبات عالية الجودة، مع ضمانات شاملة على الهيكل والأنظمة
                  الهندسية.
                </p>
                <p className="text-slate-400 text-[11px]">
                  *في النسخة المدفوعة يظهر لك الإعلان كاملًا مع بقية البوستات والرسائل.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-200">
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/70 p-3 space-y-1">
                  <p className="font-semibold text-slate-50 text-xs mb-1">ماذا تحصل؟</p>
                  <p>إعلانات جاهزة، بوستات إنستغرام، تغريدات، رسائل واتساب، وأفكار شعارات.</p>
                </div>
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/70 p-3 space-y-1">
                  <p className="font-semibold text-slate-50 text-xs mb-1">لمن؟</p>
                  <p>للمطورين العقاريين، شركات التطوير، ومكاتب التسويق العقاري.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-right space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              ثلاث خطوات بينك وبين حملة تسويقية مكتملة لمشروعك
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl ml-auto">
              صممنا رحلة الاستخدام لتناسب المطوّر العقاري: سريعة، واضحة، بدون تعقيد تقني.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-xl p-4 flex flex-col justify-between">
              <div className="absolute left-4 top-4 h-8 w-8 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-xs font-bold text-amber-300">
                1
              </div>
              <div className="pt-10 space-y-2 text-right">
                <h3 className="text-sm font-semibold text-slate-50">أدخل بيانات مشروعك</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  اسم المشروع، نوعه، المدينة والحي، عدد الوحدات، نطاق الأسعار، الفئة المستهدفة،
                  والمميزات التي تود إبرازها.
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 flex flex-col justify-between">
              <div className="absolute left-4 top-4 h-8 w-8 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-xs font-bold text-amber-300">
                2
              </div>
              <div className="pt-10 space-y-2 text-right">
                <h3 className="text-sm font-semibold text-slate-50">دع الذكاء الاصطناعي يعمل</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  خلال ثوانٍ يتم توليد إعلان عقاري رئيسي، محتوى للسوشيال ميديا، رسائل واتساب،
                  وأفكار شعارات وهوية للمشروع.
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 flex flex-col justify-between">
              <div className="absolute left-4 top-4 h-8 w-8 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-xs font-bold text-amber-300">
                3
              </div>
              <div className="pt-10 space-y-2 text-right">
                <h3 className="text-sm font-semibold text-slate-50">انسخ، عدّل، وانطلق بحملتك</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  انسخ النصوص، عدّل عليها بما يناسب نبرة علامتك، وابدأ النشر على قنواتك بضغطة
                  زر.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700/80 bg-slate-900/40 backdrop-blur-xl px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-right max-w-xl">
            <h2 className="text-lg md:text-xl font-bold text-white">
              جرّب مشروعًا واحدًا مجانًا، ثم قرر بهدوء
            </h2>
            <p className="text-sm text-slate-300">
              الحساب المجاني يتيح لك إنشاء مشروع واحد ورؤية جزء من النتائج. إذا أعجبك أسلوب
              الكتابة وجودة المحتوى، يمكنك الترقية لاشتراك شهري أو سنوي وفتح كل المحتوى لكل
              مشاريعك.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 w-full md:w-auto">
            {isLoggedIn ? (
              <>
                <Link
                  href="/projects/new"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.35)] hover:from-amber-300 hover:to-amber-400 transition-all"
                >
                  ابدأ مشروعًا جديدًا الآن
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-slate-600 text-slate-100 text-xs font-medium hover:bg-slate-800/80 transition-colors"
                >
                  الانتقال إلى لوحة التحكم
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.35)] hover:from-amber-300 hover:to-amber-400 transition-all"
                >
                  ابدأ التجربة المجانية الآن
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-slate-600 text-slate-100 text-xs font-medium hover:bg-slate-800/80 transition-colors"
                >
                  تعرّف على الباقات الشهرية والسنوية
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
