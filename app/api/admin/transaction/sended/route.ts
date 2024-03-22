import { validationUserAPI } from "@/lib/userValition";
import { Producer, Transaction } from "@/prisma/generated/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from '@/db/client'

export type APIGETTransactionSendedResponse = {
  transactions: Array<
    Transaction & {
      transmitter: Producer;
      receiver: Producer;
    }
  >;
  companyId: number;
};


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
    const transactionSended = await prisma?.transaction.findMany({
      where: {
        companyId: producer?.companyId,
        receiverId: producer?.id,
        status: "SENDED",
      },
      include: {
        receiver: true,
        transmitter: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!transactionSended) {
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }

    const response: APIGETTransactionSendedResponse = {
      transactions: transactionSended,
      companyId: producer?.companyId as number,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}
