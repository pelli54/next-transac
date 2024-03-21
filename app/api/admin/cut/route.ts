import { validationUserAPI } from "@/lib/userValition";
import { NextRequest, NextResponse } from "next/server";
import type {Cut, Producer} from '@prisma/client'
import { genCode } from "@/lib/utils";

export type APIGetCutResponse = Array<Cut & {producer: Producer}>
export async function GET(req: NextRequest){
  try {
    const {error: userError, isAdmin, producer} = await validationUserAPI()
    if(userError){
      return NextResponse.json({message: userError.message},{status: userError.status})
    }
    if(!isAdmin){
      return NextResponse.json({message: 'unauthorized'},{status: 403})
    }
    
    const cuts = await prisma?.cut.findMany({
      where:{
        companyId: producer?.companyId,
      },
      orderBy:{
        createdAt:'desc'
      },
      include:{
        producer:true
      }
    })

    const response: APIGetCutResponse = cuts || []
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({message: 'server error'},{status: 500})
  }
}

export async function POST(req:NextRequest){
  try {
    if(!prisma){
      return NextResponse.json({message: 'db error'},{status: 500})  
    }
    const {error: userError, isAdmin, producer: me} = await validationUserAPI()
    if(userError){
      return NextResponse.json({message: userError.message},{status: userError.status})
    }
    if(!isAdmin){
      return NextResponse.json({message: 'unauthorized'},{status: 403})
    }
    
    const company = await prisma?.company.findUnique({where:{id:me?.companyId}})
    if(!company){
      return NextResponse.json({ message: "company not found" }, { status: 401 });
    }
    const producers = await prisma.producer.findMany({
      where:{companyId:me?.companyId,
      },
      include:{
        transacIssued:{
          where:{
            status:"ACCEPTED",
            updatedAt: {
              gt: company.lastCutDate || new Date('00:00:00 01/01/2020')
            }
          },
          orderBy:{
            updatedAt: 'asc'
          }
        },
        transacReceived:{
          where:{
            status:"ACCEPTED",
            updatedAt: {
              gt: company.lastCutDate ||new Date('00:00:00 01/01/2020')
            }
          },
          orderBy:{
            updatedAt:'asc'
          }
        }
      }
    })

    let producerTransac = producers.map(prod => ({...prod, transactions : [...prod.transacIssued, ...prod.transacReceived]}))
    
    const haveTransactions = producerTransac.some(prod => prod.transactions.length > 0)
    if(!haveTransactions){
      return NextResponse.json({message: 'Not transaction to Cut'},{status: 401})

    }
    producerTransac?.forEach(async prod => {
      if(!prisma){
        return NextResponse.json({message: 'db error'},{status: 500})  
      }
      let cutCount = await prisma.cut.count({
        where:{
          companyId:me?.companyId
        }
      })
      cutCount++
      if(!prisma){
        return NextResponse.json({message: 'db error'},{status: 500})  
      }
      if(prod.transactions.length===0){
        return 
      }
      let firstT = prod.transactions[0]
      let lastT = prod.transactions[prod.transactions.length-1]
      const cut = await prisma.cut.create({
        data:{
          balance: prod.balance||0,
          code: "CUT"+genCode(cutCount),
          startDate: firstT.updatedAt,
          endDate: lastT.updatedAt,
          companyId: prod.companyId,
          producerId: prod.id,
        }
      })
      prod.transactions.forEach(async transac => {
        if(!prisma){
          return NextResponse.json({message: 'db error'},{status: 500})  
        }
        await prisma.transactionOnCuts.create({
          data:{
            cutId: cut.id,
            transactionId: transac.id,
          }
        })
      })
      await prisma.producer.update({
        where:{
          id: prod.id
        },
        data:{
          balance:0,
          lastCutDate: cut.createdAt
        }
      })
    })
    await prisma.company.update({
      where:{
        id:me?.id
      },
      data:{
        lastCutDate: new Date()
      }
    })
    return NextResponse.json({message:'All producer cuted successfully'})
  } catch (error) {
    console.log(error)
    return NextResponse.json({message: 'server error'},{status: 500})
  }
}