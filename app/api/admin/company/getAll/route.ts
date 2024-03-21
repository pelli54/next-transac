import { validationUserAPI } from "@/lib/userValition";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { error: userError, user } = await validationUserAPI();
    if (userError && userError.type !== 'NOTPRODUCERFOUND') {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }

    const companys = await prisma?.company.findMany();
    if (!companys) {
      return NextResponse.json(
        { message: "db error" },
        { status: 500 }
      );
    }
    return NextResponse.json(companys);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}