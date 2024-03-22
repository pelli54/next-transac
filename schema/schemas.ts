import { z } from "zod" 

export const registerSchema = z
  .object({
    username: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "the passwords must be match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const transactionSchema = z.object({
  companyId: z.number().positive().int(),
  transmitterId: z.number().positive().int(),
  receiverId: z.number().positive().int(),
  currencyName: z.string(),
  currencyFactor: z.number().positive(),
  quantity: z.coerce.number().positive(),
  income: z.boolean()
}).refine(data => data.receiverId !== data.transmitterId, 'Transmitter And Receiber must be difference')

export const companySchema = z.object({
  name: z.string().min(6)
})

export const currencySchema = z.object({
  name: z.string().min(1),
  main: z.boolean().default(false),
  factor: z.coerce.number().positive(),
  companyId: z.number().positive().int(),
  id: z.number().positive().int().optional(), 
})

export const producerSchema = z.object({
  companyId: z.number().positive(),
  role: z.string().optional(),
  name: z.string().min(4),
  userId: z.number().positive().int(),
  active: z.boolean().default(true)
})

//data to create to first time a company with the primer producer an first currency
export const initializeProducerCompany = z.object({
  companyName: z.string().min(6),
  currencyName: z.string().min(1),
  producerName: z.string().min(4),
})

export const petitionSchema = z.object({
  companyId: z.number().positive().int(),
  type: z.string(),
  transmitterId: z.number().positive().int(),
  receiverId: z.number().positive().int().optional(),
  description: z.string().optional()
})

export const dataToCutSchema = z.array(z.number().positive().int()).min(1)