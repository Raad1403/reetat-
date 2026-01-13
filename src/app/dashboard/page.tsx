import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { PaymentNotification } from "@/components/payment-notification";
import { PaymentVerifier } from "@/components/payment-verifier";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { payment?: string; credits?: string; invoice_id?: string };
}) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      adCredits: true,
      usedTrialAds: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const MAX_FREE_TRIAL_ADS = 2;
  const remainingTrialAds = Math.max(0, MAX_FREE_TRIAL_ADS - user.usedTrialAds);

  const projects = await prisma.project.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <PaymentVerifier />
      <PaymentNotification status={searchParams.payment} credits={searchParams.credits} />
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-50">لوحة تحكم المطوّر</h1>
          <p className="text-sm text-slate-300">
            راجع مشاريعك التطويرية وأنشئ مشروعًا جديدًا لتوليد المحتوى التسويقي.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            رصيد الإعلانات المتاح:
            <span className="font-semibold text-amber-300 mr-1">{user.adCredits}</span>
            إعلان.
            {" "}
            التجربة المجانية المستخدمة:
            <span className="font-semibold text-emerald-300 mr-1">
              {user.usedTrialAds}
            </span>
            /{MAX_FREE_TRIAL_ADS}.
            {remainingTrialAds > 0 && (
              <span className="mr-1 text-emerald-300">
                {`متبقٍ لك ${remainingTrialAds} إعلان تجريبي مجاني.`}
              </span>
            )}
          </p>
        </div>
        <a
          href="/projects/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_14px_40px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all"
        >
          + مشروع تطوير عقاري جديد
        </a>
      </header>

      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-50">مشاريعك الحالية</h2>
          <span className="text-xs text-slate-400">
            يتم حفظ المشاريع تلقائيًا بعد إدخالها من نموذج إنشاء المشروع.
          </span>
        </div>
        <div className="overflow-x-auto">
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              لا توجد مشاريع بعد. ابدأ بإنشاء أول مشروع تطوير عقاري من الزر أعلى الصفحة.
            </p>
          ) : (
            <table className="w-full text-right text-sm text-slate-100">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-200">الشعار</th>
                  <th className="px-3 py-2 font-medium text-slate-200">اسم المشروع</th>
                  <th className="px-3 py-2 font-medium text-slate-200">المدينة</th>
                  <th className="px-3 py-2 font-medium text-slate-200">حالة المشروع</th>
                  <th className="px-3 py-2 font-medium text-slate-200">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project: { id: number; title: string; city: string | null; status: string; logoUrl: string | null }) => (
                  <tr
                    key={project.id}
                    className="border-b border-slate-700/60 last:border-0 hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-3 py-2">
                      {project.logoUrl ? (
                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-700/70 bg-slate-950/60 flex items-center justify-center">
                          <img
                            src={project.logoUrl}
                            alt={`شعار ${project.title}`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{project.title}</td>
                    <td className="px-3 py-2">{project.city || "-"}</td>
                    <td className="px-3 py-2 text-sm text-slate-300">{project.status}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-start gap-1">
                        <a
                          href={`/projects/${project.id}`}
                          className="text-amber-300 text-xs font-semibold hover:text-amber-200"
                        >
                          عرض المحتوى
                        </a>
                        <DeleteProjectButton projectId={project.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
