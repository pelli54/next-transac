import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest){
  try {
    const session = await getServerSession()
    if(!session){
      return NextResponse.json({ message: "unauthorized" }, { status: 403 });
    }
    const userDB = await prisma?.user.findUnique({where:{email: session.user?.email}})
    if(!userDB){
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }
    const producerFound = await prisma?.producer.findFirst({
      where: {
        userId: Number(userDB.id)
      },
      include:{
        company: true
      }
    })
    if(!producerFound){
      return NextResponse.json(null);
    }
    return NextResponse.json(producerFound)
  } catch (error) {
    console.log(error)
    return NextResponse.json(
        { message: "error server" },
        { status: 500 }
      );
  }
}