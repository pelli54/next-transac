import { validationUserAPI } from "@/lib/userValition";
import { petitionSchema } from "@/schema/schemas";
import { PetitionSchemaType } from "@/types/Types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { error: userError, producer, isAdmin} = await validationUserAPI();
    if (userError) {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if(!isAdmin){
      return NextResponse.json([]);
    }
    const petitionFound = await prisma?.petition.findMany({
      where: {
        companyId: producer?.companyId,
        receiverId: producer?.id
      },
      include:{
        transmitter: true
      }
    })
    return NextResponse.json(petitionFound)
  }catch(error){
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error: userError, user} = await validationUserAPI();
    if (userError && userError.type !== "NOTPRODUCERFOUND") {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }

    if(!user){
      return NextResponse.json(
        { message: "unauthrized" },
        { status: 404 }
      );
    }
    const data: PetitionSchemaType = await req.json()
    const resultParse = petitionSchema.safeParse(data)
    if(!resultParse.success){
      return NextResponse.json(
        { message: "invalid data petition" },
        { status: 401 }
      );
    }
    const admin = await prisma?.producer.findFirst({
      where: {
        role: 'ADMIN',
        companyId:data.companyId
      },
      include:{
        user:true
      }
    })
    if(!admin){
      return NextResponse.json(
        { message: "admin not found" },
        { status: 404 }
      );
    }
    const petitionFound = await prisma?.petition.findFirst({
      where:{
        status: 'SENDED',
        companyId: data.companyId,
        transmitterId: data.transmitterId,
        receiverId: admin.id
      }
    })
    if(petitionFound){
      return NextResponse.json({message:'you already sended petition to this company'}, {status: 401})
    }
    const petitionCreated = await prisma?.petition.create({
      data: {
        status:'SENDED',
        companyId: data.companyId,
        receiverId: admin.user.id,
        transmitterId: Number(user.id),
        type:data.type,
        description: data.description || '',
      }
    })
    return NextResponse.json(petitionCreated)
  }catch(error){
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}

