import { validationUserAPI } from "@/lib/userValition";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, {params}: {params:{id:string}}){
  try {
    const id = params.id
    if(Number.isNaN(Number(id))){
      return NextResponse.json({message:'invalid Id'}, {status:401})
    }
    const {error: userError, producer, isAdmin} = await validationUserAPI()
    if(userError){
      return NextResponse.json({message:userError?.message}, {status:userError?.status})
    }
    if(!isAdmin){
      return NextResponse.json({message:'unauthrized, No Admin'}, {status:403})
    }
    const petitionUpdated = await prisma?.petition.update({
      where:{
        id: Number(id)
      },
      data:{
        status:'DENY'
      }
    })
    if(!petitionUpdated){
      return NextResponse.json({message:'db error'}, {status:500})
    }
    return NextResponse.json(petitionUpdated)
  } catch (error) {
    return NextResponse.json({message:'db error'}, {status:500})
  }
} 