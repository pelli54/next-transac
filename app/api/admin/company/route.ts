import { NextRequest, NextResponse } from "next/server";
import type { Company } from "@prisma/client";
import { CompanySchemaType } from "@/types/Types";
import { companySchema } from "@/schema/schemas";
import { validationUserAPI } from "@/lib/userValition";
import prisma from '@/db/client'


export async function GET(req: NextRequest) {
  try {
    const { error: userError, producer } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }

    const company = await prisma.company.findFirst({
      where: { id: producer?.companyId },
    });
    if (!company) {
      return NextResponse.json(
        { message: "invalid data company" },
        { status: 401 }
      );
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {error: userError, producer} = await validationUserAPI()
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }

    const data: CompanySchemaType = await req.json();
    const resultParse = companySchema.safeParse(data);
    if (!resultParse.success) {
      return NextResponse.json(
        { message: "zod error invalid data" },
        { status: 401 }
      );
    }

    const companyCreated = await prisma.company.create({
      data: {
        adminId: producer?.id,
        name: data.name,
      },
    });
    return NextResponse.json(companyCreated)
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
    if(!isAdmin){
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }

    const data: CompanySchemaType = await req.json();
    const resultParse = companySchema.safeParse(data);
    if (!resultParse.success) {
      return NextResponse.json(
        { message: "zod error invalid data" },
        { status: 401 }
      );
    }
    
    const companyUpdate = await prisma?.company.update({
      where:{
        id: producer?.companyId,
      },
      data:{
        name: data.name
      }
    })
    if(!companyUpdate){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    return NextResponse.json<Company>(companyUpdate)
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}