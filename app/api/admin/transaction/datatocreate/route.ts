import { validationUserAPI } from "@/lib/userValition";
import { Currency, Producer } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface DatatoCreateTransaction {
  currency: Currency[];
  producer: {
    companyId: number;
    id: number;
    role: string;
    name: string;
    userId: number;
  }[];
  myProducer: Producer
}

export async function GET(req: NextRequest) {
  try {
    const {
      error: userError,
      user: userData,
      isActive,
      producer,
    } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if (!isActive) {
      return NextResponse.json(
        { message: "unauthorized producer not active" },
        { status: 403 }
      );
    }
    let currencys = await prisma?.currency.findMany({
      where: {
        companyId: producer?.companyId,
      },
    });
    const producers = await prisma?.producer.findMany({
      where: {
        active: true,
        companyId: producer?.companyId,
      },
    });
    if (!currencys || !producers) {
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    const producersToClient = producers?.map((prod) => ({
      companyId: prod.companyId,
      id: prod.id,
      role: prod.role,
      name: prod.name,
      userId: prod.userId,
    })).filter(prod => prod.id !== producer?.id);
    return NextResponse.json({
      currency: currencys,
      producer: producersToClient,
      myProducer: producer
    });
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}
