import { validationUserAPI } from "@/lib/userValition";
import { initializeProducerCompany } from "@/schema/schemas";
import { InitializeSchemaType } from "@/types/Types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {error: userError, user} = await validationUserAPI()
    if (userError && userError.type !== "NOTPRODUCERFOUND") {
      return NextResponse.json(
        { message: userError.message },
        { status: userError.status }
      );
    }
    const data: InitializeSchemaType = await req.json();
    const resultParse = initializeProducerCompany.safeParse(data);
    if (!resultParse.success) {
      return NextResponse.json(
        { message: "zod error invalid data" },
        { status: 401 }
      );
    }

    //STED 1 -- create the company
    const companyFound = await prisma?.company.findFirst({where:{name: data.companyName}})
    if(companyFound){
      return NextResponse.json({ message: "company already exist" }, { status: 401 });

    }
    const companycreated = await prisma?.company.create({
      data:{
        name:data.companyName,
      }
    })
    if(!companycreated){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }

    //STED 2 -- create the producer 
    const producerCreated = await prisma?.producer.create({
      data:{
        companyId:companycreated.id,
        name: data.producerName,
        role: 'ADMIN',
        userId: Number(user?.id),
        balance: 0,
      }
    })
    if(!producerCreated){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }

    //STEP 3 -- create the currency
    const currencyCreated = await prisma?.currency.create({
      data:{
        factor:1,
        main:true,
        name: data.currencyName,
        companyId: companycreated.id,
      }
    })
    if(!currencyCreated){
      return NextResponse.json({ message: "db error" }, { status: 500 });
    }

    //STEP 4 -- asign the producer to company.adminId
    await prisma?.company.update({
      where:{
        id: companycreated.id
      },
      data:{
        adminId:producerCreated.id
      }
    })

    return NextResponse.json({
      message:'Initialize successfully'
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}
