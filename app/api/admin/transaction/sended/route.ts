import { validationUserAPI } from "@/lib/userValition";
import { Currency, Producer, Transaction } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export type APIGETTransactionSendedResponse = {
  transactions:Array<Transaction & {
    transmitter: Producer;
    receiver: Producer;
  }>
  companyId:number
}


export async function GET(req: NextRequest) {
  if(!prisma){
    return NextResponse.json(
      { message: "DB error" },{ status: 500 }
    );
  }
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
    const transactionSended = await prisma.transaction.findMany({
      where: {
        companyId: producer?.companyId,
        receiverId: producer?.id,
        status: "SENDED",
      },
      include: {
        receiver: true,
        transmitter: true,
      },
      orderBy:{
        createdAt:'desc'
      }
    });

    const response: APIGETTransactionSendedResponse = {
      transactions: transactionSended,
      companyId:producer?.companyId as number
    }
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}
