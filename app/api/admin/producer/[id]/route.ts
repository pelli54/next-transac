import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server"
import prisma from '@/db/client'


export async function GET(req: NextRequest, {params}: {params:{id:string}}){
  try {
    const id = await params.id
    if(!id || Number.isNaN(Number(id))){
      return NextResponse.json(
        { message: "invalid id" },
        { status: 401 }
      );
    }
    const session = await getServerSession()
    if(!session){
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }

    const producerFound = await prisma?.producer.findFirst({
      where: {
        userId: Number(id)
      },
      include:{
        company: true
      }
    })
    return NextResponse.json(producerFound)
  } catch (error) {
    return NextResponse.json(
        { message: "error server" },
        { status: 500 }
      );
  }
}