import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "خدمة تحسين الصور غير مفعّلة حاليًا، يرجى إضافة مفتاح OpenAI API إلى إعدادات الخادم.",
        },
        { status: 503 }
      );
    }

    const incomingForm = await req.formData();
    const file = incomingForm.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "الرجاء إرسال ملف صورة واحد على الأقل." },
        { status: 400 }
      );
    }

    const mimeType = file.type || "image/png";
    const fileName = file.name || "image.png";

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append("image", blob, fileName);
    formData.append("model", "gpt-image-1");
    formData.append(
      "prompt",
      "حسّن جودة هذه الصورة لمشروع تطوير عقاري: وضوح أعلى، إضاءة أفضل، ألوان متوازنة تناسب الإعلانات الرقمية والبروشورات."
    );
    formData.append("size", "1024x1024");
    formData.append("n", "1");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("OpenAI image enhance error", await response.text());
      return NextResponse.json(
        { error: "تعذّر تحسين الصورة حاليًا، حاول مرة أخرى لاحقًا." },
        { status: 500 }
      );
    }

    const json = (await response.json()) as any;
    const url = json?.data?.[0]?.url as string | undefined;
    const b64 = json?.data?.[0]?.b64_json as string | undefined;

    let imageSrc: string | null = null;
    if (url) {
      imageSrc = url;
    } else if (b64) {
      imageSrc = `data:image/png;base64,${b64}`;
    }

    if (!imageSrc) {
      return NextResponse.json(
        { error: "لم يتم استلام صورة محسّنة من مزوّد الذكاء الاصطناعي." },
        { status: 500 }
      );
    }

    const imageBase64 = imageSrc;

    // حفظ الصورة المحسّنة مع المشروع
    try {
      await prisma.projectImage.create({
        data: {
          projectId,
          url: imageBase64,
          kind: "enhanced",
        },
      });
    } catch (persistError) {
      console.error("Persist enhanced project image error", persistError);
    }

    return NextResponse.json({ imageBase64 }, { status: 200 });
  } catch (error) {
    console.error("Enhance project image error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الصورة، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
