import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set("userId", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الخروج، حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
