import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      city: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(projects, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const titleInput = (body.title as string | undefined)?.trim() ?? "";
    const city = (body.city as string | undefined)?.trim() ?? "";
    const status = (body.status as string | undefined)?.trim() ?? "على المخطط";
    const description = (body.description as string | undefined)?.trim() ?? "";

    if (!titleInput && !city) {
      return NextResponse.json(
        { error: "يجب إدخال اسم للمشروع أو مدينة على الأقل." },
        { status: 400 }
      );
    }

    const title = titleInput || `مشروع بدون اسم${city ? ` - ${city}` : ""}`;

    const project = await prisma.project.create({
      data: {
        title,
        city: city || null,
        status,
        description: description || null,
        userId: Number(userId),
      },
      select: {
        id: true,
        title: true,
        city: true,
        status: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء المشروع، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
