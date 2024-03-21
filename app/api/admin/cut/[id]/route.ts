import { validationUserAPI } from "@/lib/userValition";
import { genCode } from "@/lib/utils";
import { Cut, Producer, Transaction } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export type APIGETCutIdResponse = {
  cut: Cut & { producer: Producer };
  transactions: Array<
    Transaction & {
      reciever:Producer,
      transmitter:Producer
    }
  >
};
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    const id = Number(params.id);
    const { error: userError, isAdmin, producer } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if (!isAdmin) {
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "id invalid" }, { status: 401 });
    }

    const cut = await prisma?.cut.findFirst({
      where: {
        companyId: producer?.companyId,
        id,
      },
      include:{
        producer:true
      }
    });
    if (!cut) {
      return NextResponse.json({ message: "Cut not found" }, { status: 404 });
    }
    let transactionsoncut = await prisma.transactionOnCuts.findMany({
      where: {
        cutId: cut.id,
      },
      include: {
        transaction: {
          include:{
            receiver:true,
            transmitter:true
          }
        }
      },
    });
    const response: APIGETCutIdResponse = {
      cut,
      transactions : transactionsoncut.map((t) => t.transaction)
    }
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    const {
      error: userError,
      isAdmin,
      producer: me,
    } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if (!isAdmin) {
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }
    const producerId = Number(params.id);
    if (Number.isNaN(producerId)) {
      return NextResponse.json({ message: "id invalid" }, { status: 401 });
    }

    const producertoCut = await prisma.producer.findUnique({
      where: { id: producerId },
    });
    if (!producertoCut) {
      return NextResponse.json(
        { message: "producer not found" },
        { status: 404 }
      );
    }
    const producer = await prisma.producer.findFirst({
      where: { companyId: me?.companyId, id: producerId },
      include: {
        transacIssued: {
          where: {
            updatedAt: {
              gt: producertoCut.lastCutDate || new Date("00:00:00 01/01/2020"),
            },
            status: "ACCEPTED",
          },
          orderBy: {
            updatedAt: "asc",
          },
        },
        transacReceived: {
          where: {
            updatedAt: {
              gt: producertoCut.lastCutDate || new Date("00:00:00 01/01/2020"),
            },
            status: "ACCEPTED",
          },
          orderBy: {
            updatedAt: "asc",
          },
        },
      },
    });
    if (!producer) {
      return NextResponse.json(
        { message: "producer invalid" },
        { status: 401 }
      );
    }
    let producerTransac = {
      ...producer,
      transactions: [...producer?.transacIssued, ...producer.transacReceived],
    };
    let cutCount = await prisma.cut.count({
      where: {
        companyId: me?.companyId,
      },
    });
    if (producerTransac.transactions.length === 0) {
      return NextResponse.json(
        { message: "Producer dont have transaction to cut" },
        { status: 201 }
      );
    }
    let firstT = producerTransac.transactions[0];
    let lastT =
      producerTransac.transactions[producerTransac.transactions.length - 1];
    const cut = await prisma?.cut.create({
      data: {
        balance: producerTransac.balance || 0,
        code: "CUT" + genCode(cutCount),
        startDate: firstT.updatedAt,
        endDate: lastT.updatedAt,
        companyId: producerTransac.companyId,
        producerId: producerTransac.id,
      },
    });
    cutCount++;
    producerTransac.transactions.forEach(async (transac) => {
      if (!prisma) {
        return NextResponse.json({ message: "db error" }, { status: 500 });
      }
      await prisma.transactionOnCuts.create({
        data: {
          cutId: cut.id,
          transactionId: transac.id,
        },
      });
    });
    await prisma.producer.update({
      where: {
        id: producertoCut.id,
      },
      data: {
        lastCutDate: new Date(),
      },
    });

    return NextResponse.json({ message: "Producer Cuted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}
