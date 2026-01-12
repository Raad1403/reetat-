import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const projectId = Number(params.id);
    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        { error: "معرّف المشروع غير صالح." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: Number(userId),
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "المشروع غير موجود أو لا يخص هذا المستخدم." },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        adCredits: true,
        usedTrialAds: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const MAX_FREE_TRIAL_ADS = 2;
    let useTrial = false;
    let useCredit = false;

    if (user.usedTrialAds < MAX_FREE_TRIAL_ADS) {
      useTrial = true;
    } else if (user.adCredits > 0) {
      useCredit = true;
    } else {
      return NextResponse.json(
        {
          error:
            "لا يوجد لديك رصيد إعلانات كافٍ لتوليد محتوى جديد. قم بشراء حزمة من صفحة التسعير.",
        },
        { status: 402 }
      );
    }

    const city = project.city || "مدينتك";
    const title = project.title || "مشروعك التطويري";

    const buildFallbackContent = () => {
      const fallbackHeroAd = `اكتشف ${title} في ${city}، مشروع تطوير عقاري يوازن بين الفخامة والتخطيط الذكي، مع مساحات مدروسة بعناية وتجربة سكنية تناسب العائلات الباحثة عن جودة وسعر منافس.`;

      const fallbackInstagramPost = `تخيّل تعيش في ${title} بـ ${city}، حيث التصميم العصري، المساحات الرحبة، والتشطيبات العالية الجودة. عدد محدود من الوحدات وبأسعار تنافسية. احجز موعد زيارة اليوم وكن من أوائل المستفيدين.`;

      const fallbackWhatsappMessage = `أهلًا بك 👋\n\nيسعدنا نعرّفك على مشروع ${title} في ${city}، مشروع سكني/تطويري بتصميم حديث ومساحات متنوعة تناسب احتياجك، مع ضمانات وتشطيبات عالية الجودة.\n\nإذا حاب نرسل لك تفاصيل الأسعار والمخططات والصور، رد بكلمة (مهتم) وسنتواصل معك مباشرة.`;

      const fallbackLogoIdea = `اقتراح اسم وهوية: "${title}" بهوية بصرية تمزج بين ألوان ذهبية ودرجات كحلي داكن، مع شعار يعكس فخامة الواجهات المعمارية للمشروع.`;

      return {
        heroAd: fallbackHeroAd,
        instagramPost: fallbackInstagramPost,
        whatsappMessage: fallbackWhatsappMessage,
        logoIdea: fallbackLogoIdea,
      };
    };

    let heroAd: string;
    let instagramPost: string;
    let whatsappMessage: string;
    let logoIdea: string;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // في حال عدم توفر مفتاح OpenAI نستخدم النصوص الافتراضية
      ({ heroAd, instagramPost, whatsappMessage, logoIdea } = buildFallbackContent());
    } else {
      try {
        const prompt = `أنت خبير تسويق عقاري يكتب نصوصًا إعلانية احترافية باللغة العربية لمشاريع تطوير عقاري في السعودية والخليج.

المطلوب: كتابة ٤ عناصر محتوى لمشروع تطوير عقاري:
- إعلان رئيسي للبروشور أو صفحة الهبوط (heroAd)
- نص منشور إنستغرام (instagramPost)
- رسالة واتساب مهيأة للإرسال للعملاء المحتملين (whatsappMessage)
- فكرة شعار وهوية بصرية للمشروع (logoIdea)

بيانات المشروع:
- اسم المشروع: ${title}
- المدينة: ${city}
- وصف مختصر (إن وُجد): ${project.description || "لم يتم إدخال وصف تفصيلي"}

التنسيق:
أعد لي استجابة بصيغة JSON فقط بدون أي نص آخر، وبالمفتاح التالي:
{
  "heroAd": "...",
  "instagramPost": "...",
  "whatsappMessage": "...",
  "logoIdea": "..."
}`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "أنت مساعد خبير في كتابة المحتوى التسويقي العقاري باللغة العربية الفصحى الموجهة للسعودية والخليج.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.8,
          }),
        });

        if (!response.ok) {
          console.error("OpenAI API error", await response.text());
          ({ heroAd, instagramPost, whatsappMessage, logoIdea } = buildFallbackContent());
        } else {
          const json = (await response.json()) as any;
          const content = json?.choices?.[0]?.message?.content as string | undefined;

          if (!content) {
            ({ heroAd, instagramPost, whatsappMessage, logoIdea } = buildFallbackContent());
          } else {
            let parsed: any;
            try {
              parsed = JSON.parse(content);
            } catch {
              const match = content.match(/\{[\s\S]*\}/);
              if (!match) {
                ({ heroAd, instagramPost, whatsappMessage, logoIdea } = buildFallbackContent());
              } else {
                parsed = JSON.parse(match[0]);
              }
            }

            heroAd = parsed?.heroAd || buildFallbackContent().heroAd;
            instagramPost = parsed?.instagramPost || buildFallbackContent().instagramPost;
            whatsappMessage = parsed?.whatsappMessage || buildFallbackContent().whatsappMessage;
            logoIdea = parsed?.logoIdea || buildFallbackContent().logoIdea;
          }
        }
      } catch (err) {
        console.error("OpenAI generation failed, using fallback", err);
        ({ heroAd, instagramPost, whatsappMessage, logoIdea } = buildFallbackContent());
      }
    }

    const content = await prisma.generatedContent.upsert({
      where: { projectId },
      update: {
        heroAd,
        instagramPost,
        whatsappMessage,
        logoIdea,
      },
      create: {
        projectId,
        heroAd,
        instagramPost,
        whatsappMessage,
        logoIdea,
      },
      select: {
        id: true,
        projectId: true,
        heroAd: true,
        instagramPost: true,
        whatsappMessage: true,
        logoIdea: true,
      },
    });

    if (useTrial) {
      await prisma.user.update({
        where: { id: user.id },
        data: { usedTrialAds: { increment: 1 } },
      });
    } else if (useCredit) {
      await prisma.user.update({
        where: { id: user.id },
        data: { adCredits: { decrement: 1 } },
      });
    }

    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error("Generate AI content error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء توليد المحتوى، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
