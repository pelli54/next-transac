import { validationUserAPI } from "@/lib/userValition";
import { getPusherInstance } from "@/pusher/server";
import { NextRequest, NextResponse } from "next/server";

const pusher = getPusherInstance()

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (Number.isNaN(Number(id))) {
      return NextResponse.json({ message: "invalid Id" }, { status: 401 });
    }
    const { error: userError, producer, isAdmin } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError?.message },
        { status: userError?.status }
      );
    }
    const transaction = await prisma?.transaction.findUnique({
      where: {
        id: Number(id),
        companyId: producer?.companyId
      },
    });
    if (!transaction) {
      return NextResponse.json(
        { message: "transaction not found" },
        { status: 404 }
      );
    }
    if (transaction.receiverId !== producer?.id) {
      return NextResponse.json(
        { message: "You are not the Receiver" },
        { status: 403 }
      );
    }

    //update status of transaction
    await prisma?.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "ACCEPTED",
      },
    });

    let amount = transaction.quantity * transaction.currencyFactor;
    let income = transaction.income;
    //update balance of transmitter
    await prisma?.producer.update({
      where: { id: transaction.transmitterId,  },
      data: {
        balance: {
          increment: income ? 1 * amount : -1 * amount,
        },
      },
    });
    //update balance of receiver
    await prisma?.producer.update({
      where: { id: transaction.receiverId },
      data: {
        balance: {
          increment: income ? -1 * amount : 1 * amount,
        },
      },
    });

    pusher.trigger('company'+producer.companyId, 'updateTransactions',{})

    return NextResponse.json({ message: "transaction updated" });
  } catch (error) {
    return NextResponse.json({ message: "db error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (Number.isNaN(Number(id))) {
      return NextResponse.json({ message: "invalid Id" }, { status: 401 });
    }
    const { error: userError, producer, isAdmin } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError?.message },
        { status: userError?.status }
      );
    }
    const transaction = await prisma?.transaction.findUnique({
      where: {
        id: Number(id),
        companyId: producer?.companyId
      },
    });
    if (!transaction) {
      return NextResponse.json(
        { message: "transaction not found" },
        { status: 404 }
      );
    }
    if (transaction.receiverId !== producer?.id) {
      return NextResponse.json(
        { message: "You are not the Receiver" },
        { status: 403 }
      );
    }

    //update status of transaction
    await prisma?.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "DENY",
      },
    });

    pusher.trigger('company'+producer.companyId, 'updateTransactions',{})

    return NextResponse.json({ message: "transaction updated" });
  } catch (error) {
    return NextResponse.json({ message: "db error" }, { status: 500 });
  }
}
