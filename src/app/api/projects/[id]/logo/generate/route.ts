import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: Request, { params }: RouteParams) {
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
      include: {
        generatedContent: true,
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
        adCredits: true,
        usedTrialAds: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const MAX_FREE_TRIAL_ADS = 2;
    const noTrialLeft = user.usedTrialAds >= MAX_FREE_TRIAL_ADS;
    const noPaidCredits = user.adCredits <= 0;

    if (noTrialLeft && noPaidCredits) {
      return NextResponse.json(
        {
          error:
            "لا يوجد لديك رصيد إعلانات كافٍ لتوليد محتوى جديد. قم بشراء حزمة من صفحة التسعير.",
        },
        { status: 402 }
      );
    }

    let customPrompt: string | undefined;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const body = (await req.json()) as { prompt?: string };
        if (body.prompt && typeof body.prompt === "string") {
          const trimmed = body.prompt.trim();
          if (trimmed) {
            customPrompt = trimmed;
          }
        }
      } catch {
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "خدمة توليد الشعارات غير مفعّلة حاليًا، يرجى إضافة مفتاح OpenAI API إلى إعدادات الخادم.",
        },
        { status: 503 }
      );
    }

    const title = project.title || "مشروعك التطويري";
    const city = project.city || "مدينتك";
    const description = project.description || "لم يتم إدخال وصف تفصيلي";
    const logoIdea = project.generatedContent?.logoIdea;

    const promptParts: string[] = [];
    promptParts.push("صمّم شعارات مقترحة لمشروع تطوير عقاري.");
    promptParts.push("");
    promptParts.push(`اسم المشروع: ${title}`);
    promptParts.push(`المدينة: ${city}`);
    promptParts.push(`الوصف: ${description}`);
    promptParts.push("");
    if (logoIdea) {
      promptParts.push(`فكرة الشعار والهوية المقترحة نصيًا: ${logoIdea}`);
      promptParts.push("");
    }
    if (customPrompt) {
      promptParts.push(`تفضيلات إضافية من المطوّر حول الشعار: ${customPrompt}`);
      promptParts.push("");
    }
    promptParts.push("المطلوب: صور شعارات بسيطة وعصرية مناسبة لمشروع عقاري في السعودية والخليج.");
    promptParts.push("- نمط مسطح (flat) وحديث.");
    promptParts.push("- ألوان مستوحاة من الهوية المقترحة إن وُجدت، أو ألوان عقارية فاخرة (ذهبي، كحلي، أبيض).");
    promptParts.push("- بدون نصوص إن أمكن، أو بنص عربي بسيط جدًا إن لزم.");
    promptParts.push("- الخلفية شفافة أو داكنة مناسبة للاستخدام في المواد التسويقية.");

    const prompt = promptParts.join("\n");

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 2,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      console.error("OpenAI logo image generation error", await response.text());
      return NextResponse.json(
        { error: "تعذّر توليد الشعارات حاليًا، حاول مرة أخرى لاحقًا." },
        { status: 500 }
      );
    }

    const json = (await response.json()) as any;

    const logos: string[] = Array.isArray(json?.data)
      ? json.data
          .map((item: any) => {
            const url = item?.url as string | undefined;
            const b64 = item?.b64_json as string | undefined;
            if (url) return url;
            if (b64) return `data:image/png;base64,${b64}`;
            return undefined;
          })
          .filter((value: string | undefined): value is string => Boolean(value))
      : [];

    if (logos.length === 0) {
      return NextResponse.json(
        { error: "لم يتم توليد أي شعارات، حاول مرة أخرى." },
        { status: 500 }
      );
    }

    // حفظ الشعارات المولّدة مع المشروع
    try {
      await prisma.projectLogo.createMany({
        data: logos.map((url) => ({
          projectId,
          url,
        })),
      });
    } catch (persistError) {
      console.error("Persist project logos error", persistError);
    }

    return NextResponse.json({ logos }, { status: 200 });
  } catch (error) {
    console.error("Generate project logo images error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء توليد الشعارات، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
