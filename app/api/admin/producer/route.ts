import { NextRequest, NextResponse } from "next/server";
import type { Company, Producer } from "@prisma/client";
import { ProducerSchemaType } from "@/types/Types";
import { producerSchema } from "@/schema/schemas";
import { validationUserAPI } from "@/lib/userValition";

export type APIGetProducerResponse = Array<Producer & {company: Company}>
export async function GET(req: NextRequest) {
  try {
    const {
      error: userError,
      user: userData,
      producer,
    } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }

    const producerFound: Producer[] | undefined =
      await prisma?.producer.findMany({
        where: {
          companyId: producer?.companyId,
        },
        include: {
          company: true,
        },
      });
    if (producerFound === undefined) {
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    return NextResponse.json(producerFound);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}

// only ADMIN can create Producer
export async function POST(req: NextRequest) {
  try {
    const {
      error: userError,
      user: userData,
      isAdmin,
    } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if (!isAdmin || !userData) {
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }

    const data: ProducerSchemaType = await req.json();
    const resultParse = producerSchema.safeParse(data);
    if (!resultParse.success) {
      return NextResponse.json(
        { message: "invalid data producer" },
        { status: 401 }
      );
    }
    const producerCreated = await prisma?.producer.create({
      data: {
        name: data.name,
        role: data.role || "STANDARD",
        companyId: data.companyId,
        balance: 0,
        userId: data.userId,
      },
    });


    const petition = await prisma?.petition.findFirst({
      where: {
        transmitterId: data.userId,
        status: "SENDED",
        companyId: data.companyId,
        receiverId: Number(userData.id),
      }
    });
    if(!petition){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    await prisma?.petition.update({where: { id: petition.id }, data: { status: "ACCEPTED" }})

    return NextResponse.json(producerCreated);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error: userError, producer, isAdmin } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if (producer === null) {
      return NextResponse.json(
        { message: "Producer not found" },
        { status: 404 }
      );
    }
    if (!isAdmin) {
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }
    const data: ProducerSchemaType = await req.json();
    const resultParse = producerSchema.safeParse(data);
    if (!resultParse.success) {
      return NextResponse.json(
        { message: "invalid data producer" },
        { status: 401 }
      );
    }

    const producerUpdated = await prisma?.producer.update({
      where: {
        userId: data.userId,
        companyId: data.companyId,
      },
      data: {
        active: producer.userId === data.userId ? true : data.active,
        name: data.name,
        role: producer.userId === data.userId ? "ADMIN" : data.role,
      },
    });
    if (producerUpdated === undefined) {
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    return NextResponse.json(producerUpdated);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}
