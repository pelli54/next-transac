import { transactionSchema } from "@/schema/schemas";
import { TransactionSchemaType } from "@/types/Types";
import { NextRequest, NextResponse } from "next/server";
import type { Transaction } from "@/prisma/generated/client";
import { validationUserAPI } from "@/lib/userValition";
import { getPusherInstance } from "@/pusher/server";
import prisma from '@/db/client'


const pusher = getPusherInstance()

export async function GET(req: NextRequest) {
  try {
    const { error: userError, user: userData, isActive, producer, isAdmin } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if(!isActive){
      return NextResponse.json({ message: "unauthorized producer not active" }, { status: 403 });
    }

    const company = await prisma?.company.findUnique({where:{id:producer?.companyId}})
    if(!company){
      return NextResponse.json({ message: "company not found" }, { status: 401 });
    }

    let transactions: Transaction[] | undefined = undefined
    if(isAdmin){
      transactions = await prisma?.transaction.findMany({
        where:{
          companyId: producer?.companyId,
          updatedAt: {
            gt: company?.lastCutDate || new Date('00:00:00 01/01/2020')
          }
        },
        include:{ 
          receiver: true,
          transmitter: true
        },
        orderBy:{
          updatedAt:'desc'
        }
      })
      return NextResponse.json({transactions, me: producer});
    }else {
      transactions = await prisma?.transaction.findMany({
        where:{
          companyId: producer?.companyId,
          updatedAt:{
            gt: producer?.lastCutDate || new Date('00:00:00 01/01/2020')
          },
          OR:[
            {
              receiverId: producer?.id
            },
            {
              transmitterId: producer?.id
            },
          ]
        },
        include:{
          receiver: true,
          transmitter: true
        },
        
        orderBy:{
          updatedAt:'desc'
        }
      })
      return NextResponse.json({transactions, me: producer});
    }
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error: userError, isActive, producer } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if(!isActive){
      return NextResponse.json({ message: "unauthorized producer not active" }, { status: 403 });
    }

    const data: TransactionSchemaType = await req.json();
    const resultParse = transactionSchema.safeParse(data);
    if (!resultParse.success) {
      return NextResponse.json(
        { message: "zod error invalid data" },
        { status: 401 }
      );
    }

    if (
      producer?.id !== data.transmitterId &&
      producer?.companyId !== data.companyId
    ) {
      return NextResponse.json(
        { message: "invalid data transmitter" },
        { status: 401 }
      );
    }

    const receiverDB = await prisma?.producer.findUnique({
      where: { id: data.receiverId, companyId: data.companyId },
    });
    if (!receiverDB) {
      return NextResponse.json(
        { message: "invalid data receiver" },
        { status: 401 }
      );
    }

    const currencyDB = await prisma?.currency.findFirst({
      where: { name: data.currencyName, companyId: data.companyId },
    });
    if (!currencyDB) {
      return NextResponse.json(
        { message: "invalid data currency" },
        { status: 401 }
      );
    }

    const transactionCreated: Transaction | undefined =
      await prisma?.transaction.create({
        data: {
          status: "SENDED",
          currencyName: data.currencyName,
          currencyFactor: data.currencyFactor,
          quantity: data.quantity,
          companyId: data.companyId,
          receiverId: data.receiverId,
          transmitterId: data.transmitterId,
          income: data.income
        },
      });
    if (!transactionCreated) {
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }

    await prisma?.company.update({
      where: {
        id: data.companyId,
      },
      data: {
        transacCount: {
          increment: 1,
        },
      },
    });
    pusher.trigger('company'+producer.companyId, 'updateTransactions',{})
    return NextResponse.json(transactionCreated);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}
