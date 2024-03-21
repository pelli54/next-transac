import { validationUserAPI } from "@/lib/userValition";
import { NextRequest, NextResponse } from "next/server";

export interface petitionToClient {
  id: number,
  companyName: string,
  status: string,
  type: string,
  transmitterId: number,
} 

export async function GET(req: NextRequest) {
  try {
    const { error: userError, user, isAdmin} = await validationUserAPI();
    if (userError && userError.type !== "NOTPRODUCERFOUND") {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    if(!user){
      return NextResponse.json({message: 'unauthtorized'}, {status:403})
    }
    const petitionFound = await prisma?.petition.findMany({
      where: {
        transmitterId: Number(user.id),
        type: 'JOINTOCOMPANY'
      },
      include:{
        company: true
      },
      orderBy:{
        createdAt: "desc"
      }
    })
    if(!petitionFound){
      return NextResponse.json([])
    }
    const response: petitionToClient[] = petitionFound?.map(peti => ({
      id: peti.id,
      companyName: peti.company.name,
      status: peti.status,
      transmitterId: peti.transmitterId,
      type: peti.type
    }))
    return NextResponse.json(response)
  }catch(error){
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}