import { NextRequest, NextResponse } from "next/server";
import type { Currency } from "@/prisma/generated/client";
import { currencySchema } from "@/schema/schemas";
import { CurrencySchemaType } from "@/types/Types";
import { validationUserAPI } from "@/lib/userValition";
import prisma from '@/db/client'



export async function GET(req: NextRequest) {
  try {
    const { error: userError, user: userData, isActive, producer } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if(!isActive){
      return NextResponse.json({ message: "unauthorized producer not active" }, { status: 403 });
    }

    const currency = await prisma?.currency.findMany({
      where: { companyId: producer?.companyId },
    });
    if (!currency) {
      return NextResponse.json(
        { message: "invalid data currency" },
        { status: 401 }
      );
    }
    return NextResponse.json(currency);
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error: userError, isAdmin, producer } = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if(!producer){
      return NextResponse.json({ message: "producer not found" }, { status: 404 });
    }
    if(!isAdmin){
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }

    const data: CurrencySchemaType = await req.json()
    const resultParse = currencySchema.safeParse(data)
    if(!resultParse.success){
      return NextResponse.json(
        { message: "zod error, invalid data currency" },
        { status: 401 }
      );
    }

    const currencyFound = await prisma?.currency.findFirst({where:{ name: data.name}})
    if(currencyFound){
      return NextResponse.json({message:'Currency already exist'}, {status:401})
    }
    const allCurrency: Currency[] | undefined = await prisma?.currency.findMany({
      where:{
        companyId: producer?.companyId,
      }
    })
    if(!allCurrency){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    const mainExist = allCurrency.find(cur => cur.main)
    if(allCurrency.length === 2){
      return NextResponse.json({ message: "You only can have two currency" }, { status: 401 });

    }
    const currencyCreated = await prisma?.currency.create({
      data:{
        factor: data.factor,
        main: !!mainExist?false:true,
        name: data.name,
        companyId: producer.companyId
      }
    })
    if(!currencyCreated){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    return NextResponse.json(currencyCreated)
  }catch(error){
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

    const data: CurrencySchemaType = await req.json();
    const resultParse = currencySchema.safeParse(data);
    if (!resultParse.success) {
      return NextResponse.json(
        { message: "zod error invalid data" },
        { status: 401 }
      );
    }
    if(!data.id){
      return NextResponse.json(
        { message: "invalid data, not currencyId" },
        { status: 401 }
      );
    }
    
    const companyUpdate = await prisma?.currency.update({
      where:{
        companyId: producer?.companyId,
        id: data.id
      },
      data:{
        name: data.name,
        factor: data.main ? 1 : data.factor
      }
    })
    if(!companyUpdate){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }
    return NextResponse.json(companyUpdate)
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}