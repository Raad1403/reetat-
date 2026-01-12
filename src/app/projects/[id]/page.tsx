import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GenerateContentButton } from "@/components/generate-content-button";
import { ProjectImagesSection } from "@/components/project-images-section";
import { ProjectLogoSection } from "@/components/project-logo-section";
import { ShareProjectButton } from "@/components/share-project-button";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/auth/login");
  }

  const projectId = Number(params.id);
  if (Number.isNaN(projectId)) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: Number(userId),
    },
    include: {
      generatedContent: true,
      logos: true,
      images: true,
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  // لاحقًا يمكن استخدام خطة اشتراك المستخدم لتحديد isSubscribed
  const isSubscribed = false; // قيمة تجريبية حاليًا

  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-50">
            نتائج المحتوى لمشروع: {project.title}
          </h1>
          <p className="text-sm text-slate-300">
            يتم توليد هذا المحتوى تلقائيًا بناءً على بيانات مشروعك وباستخدام قوالب ذكية، وسيتم لاحقًا ربطه
            بنماذج ذكاء اصطناعي حقيقية.
          </p>
          {project.logoUrl && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-amber-400/70 bg-slate-950/60 flex items-center justify-center">
                <img
                  src={project.logoUrl}
                  alt={`الشعار الرئيسي لمشروع ${project.title}`}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-xs text-slate-300">الشعار الرئيسي الحالي لهذا المشروع.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-2 w-full md:w-auto">
          <GenerateContentButton
            projectId={project.id}
            hasContent={Boolean(project.generatedContent)}
          />
          <ShareProjectButton
            projectId={project.id}
            initialPublicId={project.publicId}
          />
        </div>
      </header>

      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-50">الإعلان العقاري الرئيسي</h2>
          {!isSubscribed && (
            <span className="text-xs text-amber-300 font-medium">
              يظهر جزء من النص فقط في الحساب المجاني
            </span>
          )}
        </div>
        <div className="space-y-2 text-sm leading-relaxed text-slate-200">
          <p>
            {project.generatedContent?.heroAd ||
              "استخدم زر توليد المحتوى بالأعلى لإنشاء إعلان رئيسي مخصص لهذا المشروع بالاعتماد على اسم المشروع والمدينة."}
          </p>
          {!isSubscribed && (
            <div className="relative mt-2">
              <div className="h-24 bg-slate-200/10 rounded-lg backdrop-blur-md" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs font-medium text-slate-100 bg-slate-900/85 px-3 py-1 rounded-full border border-slate-600">
                  لعرض الإعلان كاملًا وجميع التفاصيل، قم بالترقية إلى الباقة المدفوعة.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-50">محتوى السوشيال ميديا</h2>
          {!isSubscribed && (
            <span className="text-xs text-amber-300 font-medium">
              يتم عرض نموذج واحد فقط في الحساب المجاني
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-200">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-50 text-sm">منشور إنستغرام</h3>
            <p className="bg-slate-950/30 border border-slate-700/70 rounded-xl p-3 whitespace-pre-line">
              {project.generatedContent?.instagramPost ||
                "سيتم هنا عرض منشور إنستغرام مقترح بعد توليد المحتوى."}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-50 text-sm">رسالة واتساب</h3>
            <p className="bg-slate-950/30 border border-slate-700/70 rounded-xl p-3 whitespace-pre-line">
              {project.generatedContent?.whatsappMessage ||
                "سيتم هنا عرض رسالة واتساب مقترحة للتواصل مع العملاء بعد توليد المحتوى."}
            </p>
          </div>
        </div>
        {!isSubscribed && (
          <div className="relative mt-2">
            <div className="h-24 bg-slate-200/10 rounded-lg backdrop-blur-md" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs font-medium text-slate-100 bg-slate-900/85 px-3 py-1 rounded-full border border-slate-600">
                يتم حجب بقية البوستات والتغريدات في الحساب المجاني.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-50">أفكار الشعارات والهوية</h2>
          {!isSubscribed && (
            <span className="text-xs text-amber-300 font-medium">
              تظهر فكرة شعار واحدة فقط في الحساب المجاني
            </span>
          )}
        </div>
        <ul className="list-disc list-inside text-sm space-y-1 text-slate-200">
          <li>
            {project.generatedContent?.logoIdea ||
              "بعد توليد المحتوى، سيتم اقتراح اسم وهوية بصرية مناسبة لهذا المشروع تظهر هنا."}
          </li>
        </ul>
        {!isSubscribed && (
          <div className="relative mt-2">
            <div className="h-16 bg-slate-200/10 rounded-lg backdrop-blur-md" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs font-medium text-slate-100 bg-slate-900/85 px-3 py-1 rounded-full border border-slate-600">
                بقية أفكار الشعارات والألوان المقترحة متاحة في الباقة المدفوعة.
              </p>
            </div>
          </div>
        )}
      </section>

      <ProjectLogoSection
        projectId={project.id}
        mainLogoUrl={project.logoUrl}
        initialLogos={project.logos.map((logo: { url: string }) => logo.url)}
      />

      <ProjectImagesSection
        projectId={project.id}
        initialImages={project.images
          .filter((image: { kind: string }) => image.kind === "generated")
          .map((image: { url: string }) => image.url)}
      />

      {!isSubscribed && (
        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1 text-slate-50">افتح كل المحتوى لمشاريعك</h2>
            <p className="text-sm text-slate-200">
              اشترك في الباقة الشهرية أو السنوية لعرض جميع النصوص، الشعارات، والأفكار
              التسويقية بدون أي حجب.
            </p>
          </div>
          <a
            href="/pricing"
            className="px-4 py-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_50px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all"
          >
            ترقية الاشتراك الآن
          </a>
        </section>
      )}
    </main>
  );
}
