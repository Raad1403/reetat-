import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GenerateContentButton } from "@/components/generate-content-button";
import { ProjectImagesSection } from "@/components/project-images-section";
import { ProjectLogoSection } from "@/components/project-logo-section";
import { ShareProjectButton } from "@/components/share-project-button";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      adCredits: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const hasCredits = user.adCredits > 0;

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
        </div>
        <div className="space-y-2 text-sm leading-relaxed text-slate-200">
          <p>
            {project.generatedContent?.heroAd ||
              "استخدم زر توليد المحتوى بالأعلى لإنشاء إعلان رئيسي مخصص لهذا المشروع بالاعتماد على اسم المشروع والمدينة."}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-50">محتوى السوشيال ميديا</h2>
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
      </section>

      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/40 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-50">أفكار الشعارات والهوية</h2>
        </div>
        <ul className="list-disc list-inside text-sm space-y-1 text-slate-200">
          <li>
            {project.generatedContent?.logoIdea ||
              "بعد توليد المحتوى، سيتم اقتراح اسم وهوية بصرية مناسبة لهذا المشروع تظهر هنا."}
          </li>
        </ul>
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

    </main>
  );
}
