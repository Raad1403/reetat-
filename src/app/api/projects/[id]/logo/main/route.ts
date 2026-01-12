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

    const body = (await req.json().catch(() => null)) as { logoUrl?: string } | null;

    const logoUrl = body?.logoUrl?.trim();
    if (!logoUrl) {
      return NextResponse.json(
        { error: "رابط الشعار مطلوب." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: Number(userId),
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "المشروع غير موجود أو لا يخص هذا المستخدم." },
        { status: 404 }
      );
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { logoUrl },
      select: {
        id: true,
        logoUrl: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Set main project logo error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ الشعار الرئيسي، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
