import { PrismaClient, type Producer } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient()


export type validateUserErrorType = "NOTUSERFOUND" | "NOTPRODUCERFOUND" | "NOTSESSION" | 'SERVER';
interface validationUserError {
  message: string;
  status: number;
  type: validateUserErrorType;
}
interface validationUserResult {
  error: validationUserError | null;
  isAdmin: boolean;
  isActive: boolean;
  isProducer: boolean;
  producer: Producer | null;
  user: {
    email: string;
    username: string;
    id: number | string;
  } | null;
}
export async function validationUserAPI(): Promise<validationUserResult> {
  let result: validationUserResult = {
    error: null,
    isAdmin: false,
    isActive: false,
    isProducer: false,
    producer: null,
    user: null,
  };
  const session = await getServerSession();
  try {
    if (!session) {
      result.error = {
        message: "unauthorized",
        status: 403,
        type: "NOTSESSION",
      };
      return { ...result };
    }
    const userDB = await prisma?.user.findUnique({
      where: { email: session.user.email },
    });
    if (!userDB) {
      result.error = {
        message: "user not found",
        status: 404,
        type: "NOTUSERFOUND",
      };
      return { ...result };
    }
    result.user = {
      email: userDB.email,
      id: userDB.id,
      username: userDB.username
    };
    const producer = await prisma?.producer.findUnique({
      where: { userId: userDB?.id },
    });
    if (!producer) {
      result.error = {
        message: "producer not found",
        status: 404,
        type: "NOTPRODUCERFOUND",
      };
      return { ...result };
    } else {
      const company = await prisma?.company.findUnique({
        where: { id: producer.companyId },
      });
      result.isAdmin = company?.adminId === producer.id && producer.role === 'ADMIN';
      result.isActive = producer.active;
      result.producer = producer;
      return {
        ...result,
      };
    }
  } catch (error) {
    result.error = {
      type: 'SERVER',
      message:'server error vu',
      status:500
    }
    return {...result}
  }
}
