import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(_req: Request, { params }: RouteParams) {
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

    // حذف المحتوى المولّد المرتبط بالمشروع أولًا لتجنب مشاكل القيود المرجعية
    await prisma.generatedContent
      .delete({
        where: { projectId },
      })
      .catch(() => {
        // في حال عدم وجود محتوى مولّد، نتجاهل الخطأ ونكمل الحذف
      });

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete project error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف المشروع، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
