import { prisma } from "@/lib/prisma";

interface PublicProjectPageProps {
  params: {
    publicId: string;
  };
}

export default async function PublicProjectPage({ params }: PublicProjectPageProps) {
  const { publicId } = params;

  const project = await prisma.project.findFirst({
    where: { publicId },
    include: {
      generatedContent: true,
      images: true,
    },
  });

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold text-slate-50">
            هذا الرابط غير متاح
          </h1>
          <p className="text-sm text-slate-300">
            يبدو أن هذا الرابط غير صحيح، أو أن صاحب المشروع أوقف عرضه.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 text-sm font-semibold shadow-[0_16px_40px_rgba(251,191,36,0.45)] hover:from-amber-300 hover:to-amber-400 transition-all"
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
      </main>
    );
  }

  const heroAd = project.generatedContent?.heroAd;
  const instagramPost = project.generatedContent?.instagramPost;
  const whatsappMessage = project.generatedContent?.whatsappMessage;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/70 pb-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-amber-300 tracking-[0.2em] uppercase">
              Reetat · ريتات
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
              {project.title}
            </h1>
            <p className="text-sm text-slate-300">
              {project.city ? `مشروع عقاري في ${project.city}` : "مشروع عقاري"}
            </p>
          </div>
          {project.logoUrl && (
            <div className="h-16 w-16 rounded-2xl overflow-hidden border border-amber-400/70 bg-slate-950/70 flex items-center justify-center">
              <img
                src={project.logoUrl}
                alt={`الشعار الرئيسي لمشروع ${project.title}`}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </header>

        {heroAd && (
          <section className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-2xl p-4 md:p-6 space-y-3 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
            <h2 className="text-lg font-semibold text-slate-50 mb-1">
              الإعلان الرئيسي للمشروع
            </h2>
            <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">
              {heroAd}
            </p>
          </section>
        )}

        {(instagramPost || whatsappMessage) && (
          <section className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-2xl p-4 md:p-6 space-y-4 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">
                مقترحات جاهزة للنشر
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-200">
              {instagramPost && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-50 text-sm">
                    منشور إنستغرام مقترح
                  </h3>
                  <p className="bg-slate-950/40 border border-slate-700/70 rounded-xl p-3 whitespace-pre-line">
                    {instagramPost}
                  </p>
                </div>
              )}
              {whatsappMessage && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-50 text-sm">
                    رسالة واتساب مقترحة
                  </h3>
                  <p className="bg-slate-950/40 border border-slate-700/70 rounded-xl p-3 whitespace-pre-line">
                    {whatsappMessage}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {project.images.length > 0 && (
          <section className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-2xl p-4 md:p-6 space-y-3 shadow-[0_22px_70px_rgba(15,23,42,0.85)]">
            <h2 className="text-lg font-semibold text-slate-50 mb-1">
              صور المشروع (مولدة بالذكاء الاصطناعي)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.images.map((image) => (
                <div
                  key={image.id}
                  className="rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-950/40"
                >
                  <img
                    src={image.url}
                    alt="صورة للمشروع"
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-4 border-t border-slate-800/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            هذه الصفحة تم إنشاؤها تجريبيًا عبر منصة "ريتات" لمساعدة الفرق العقارية على عرض
            مشاريعهم بطريقة سريعة وذكية.
          </p>
          <a
            href="https://reetat.ai"
            className="text-amber-300 hover:text-amber-200 font-medium"
          >
            ريتات – ذكاء تسويقي لمشاريعك العقارية
          </a>
        </footer>
      </div>
    </main>
  );
}
