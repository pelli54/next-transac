import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import prisma from '@/db/client'
import bcrypt from 'bcrypt'
import { registerSchema } from '@/schema/schemas'

type RegisterParamsAPI = z.infer<typeof registerSchema>

export async function POST(req: NextRequest) {
  try {
    const data: RegisterParamsAPI = await req.json()
    registerSchema.parse(data)

    const userFound = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (userFound) {
      return NextResponse.json(
        { message: 'user Already Exist' },
        { status: 401 }
      )
    }
    const { confirmPassword, password, ...userdata } = data
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        password: hashedPassword,
        ...userdata,
      },
    })
    return NextResponse.json({ message: 'User Created Successfully' })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'invalid data' }, { status: 403 })
    }
    console.log(error)
    return NextResponse.json({ message: 'Error in server' }, { status: 500 })
  }
}