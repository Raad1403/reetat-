import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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
      select: {
        id: true,
        publicId: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "المشروع غير موجود أو لا يخص هذا المستخدم." },
        { status: 404 }
      );
    }

    let publicId = project.publicId;

    if (!publicId) {
      publicId = randomUUID();

      try {
        await prisma.project.update({
          where: { id: projectId },
          data: { publicId },
        });
      } catch (error) {
        console.error("Error setting project publicId", error);
        return NextResponse.json(
          { error: "تعذّر إنشاء رابط العرض العام للمشروع، حاول مرة أخرى." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ publicId }, { status: 200 });
  } catch (error) {
    console.error("Publish project error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء رابط العرض العام للمشروع، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
