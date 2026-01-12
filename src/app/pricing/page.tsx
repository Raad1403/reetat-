import { PurchasePackageButton } from "@/components/purchase-package-button";

export default function PricingPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-right space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
            اختر حزمة الإعلانات التي تناسب حجم مشاريعك التطويرية
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl ml-auto">
            جميع الخطط مبنية على عدد الإعلانات التي يمكنك توليدها (نصوص + صور + أفكار هوية)،
            مع تجربة مجانية تسمح لك برؤية جودة المحتوى قبل شراء أي حزمة.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-3 mt-4">
          {/* الخطة المجانية */}
          <div className="relative rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-5 flex flex-col justify-between shadow-[0_18px_60px_rgba(15,23,42,0.85)]">
            <div className="space-y-2 text-right">
              <p className="text-xs font-semibold text-emerald-300">تجربة</p>
              <h2 className="text-lg font-bold text-slate-50">حساب تجريبي</h2>
              <p className="text-3xl font-extrabold text-slate-50">
                0<span className="text-base align-middle mr-1">ريال</span>
              </p>
              <p className="text-xs text-slate-300">
                لتجربة المنصّة والتعرّف على جودة المحتوى قبل شراء أي حزمة إعلانات.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-200">
                <li>• حتى إعلانين تجريبيين لمشروعك الأول.</li>
                <li>• عرض جزئي لبعض النصوص في الحساب المجاني.</li>
                <li>• فكرة شعار واحدة وهوية مقترحة واحدة.</li>
                <li>• مثالية لتجربة رحلة إنشاء إعلان متكامل.</li>
              </ul>
            </div>
            <div className="mt-4">
              <a
                href="/auth/register"
                className="w-full inline-flex justify-center items-center rounded-xl border border-slate-600/70 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-900/80 transition-colors"
              >
                ابدأ بالخطة المجانية
              </a>
            </div>
          </div>

          {/* حزمة 10 إعلانات */}
          <div className="relative rounded-2xl border border-amber-400/70 bg-slate-900/50 backdrop-blur-2xl p-5 flex flex-col justify-between shadow-[0_24px_80px_rgba(251,191,36,0.45)]">
            <div className="absolute -top-3 left-4 rounded-full bg-amber-400/90 px-3 py-0.5 text-[10px] font-bold text-slate-950 shadow-[0_10px_30px_rgba(251,191,36,0.55)]">
              الأنسب للبداية
            </div>
            <div className="space-y-2 text-right">
              <p className="text-xs font-semibold text-amber-200">حزمة 10 إعلانات</p>
              <h2 className="text-lg font-bold text-slate-50">بداية الحملات</h2>
              <p className="text-3xl font-extrabold text-slate-50">
                89<span className="text-base align-middle mr-1">ريال</span>
              </p>
              <p className="text-xs text-slate-200">
                مناسبة للمطور أو المكتب الذي يريد اختبار أكثر من مشروع أو حملة خلال فترة
                قصيرة.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-50">
                <li>• رصيد 10 إعلانات متكاملة (نصوص + صور + أفكار هوية).</li>
                <li>• يمكن توزيع الإعلانات على عدة مشاريع كما تشاء.</li>
                <li>• صلاحية الاستخدام خلال 12 شهرًا من تاريخ الشراء.</li>
                <li>• مثالية للتجربة الجادة مع أكثر من مشروع.</li>
              </ul>
            </div>
            <div className="mt-4">
              <PurchasePackageButton
                credits={10}
                label="شراء حزمة 10 إعلانات (عملية تجريبية بدون دفع حقيقي)"
                variant="primary"
              />
            </div>
          </div>

          {/* حزمة 50 و 100 إعلان */}
          <div className="relative rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-5 flex flex-col justify-between shadow-[0_18px_60px_rgba(15,23,42,0.85)]">
            <div className="space-y-2 text-right">
              <p className="text-xs font-semibold text-sky-300">حزم للمكاتب والشركات</p>
              <h2 className="text-lg font-bold text-slate-50">حزم الحجم الكبير</h2>
              <div className="space-y-3 mt-2 text-xs text-slate-200">
                <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3 space-y-1">
                  <p className="flex items-baseline justify-between">
                    <span className="font-semibold text-slate-50">حزمة 50 إعلان</span>
                    <span className="text-lg font-extrabold text-slate-50">
                      289<span className="text-[11px] align-middle mr-1">ريال</span>
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    مثالية لمكاتب التسويق والمطوّرين الذين يديرون عدة مشاريع سنويًا.
                  </p>
                  <p className="text-[11px] text-slate-400">≈ 5.8 ريال لكل إعلان.</p>
                </div>
                <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3 space-y-1">
                  <p className="flex items-baseline justify-between">
                    <span className="font-semibold text-slate-50">حزمة 100 إعلان</span>
                    <span className="text-lg font-extrabold text-slate-50">
                      399<span className="text-[11px] align-middle mr-1">ريال</span>
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    الأنسب لشركات التطوير والمكاتب التي تعمل على حملات مستمرة على مدار
                    العام.
                  </p>
                  <p className="text-[11px] text-slate-400">≈ 4 ريال لكل إعلان.</p>
                </div>
                <ul className="mt-1 space-y-1.5 text-xs text-slate-200">
                  <li>• يمكن توزيع الرصيد على عدد غير محدود من المشاريع.</li>
                  <li>• صلاحية الاستخدام 12 شهرًا من تاريخ الشراء.</li>
                  <li>• أولوية في الدعم الفني والاستفسارات.</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <PurchasePackageButton
                credits={50}
                label="شراء حزمة 50 إعلان (عملية تجريبية بدون دفع حقيقي)"
                variant="outline"
              />
              <PurchasePackageButton
                credits={100}
                label="شراء حزمة 100 إعلان (عملية تجريبية بدون دفع حقيقي)"
                variant="outline"
              />
            </div>
          </div>
        </section>

        <p className="text-[11px] text-slate-500 text-right">
          * حاليًا يتم تنفيذ عملية شراء الحزم بشكل تجريبي وداخلي فقط (إضافة رصيد إعلانات مباشرة
          للحساب المسجّل بدون أي دفع حقيقي). لاحقًا سيتم ربط الأزرار ببوابة الدفع ميسر ليتم إضافة
          الرصيد تلقائيًا بعد الدفع.
        </p>
      </div>
    </main>
  );
}
