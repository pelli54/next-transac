import { companySchema, currencySchema, dataToCutSchema, initializeProducerCompany, petitionSchema, producerSchema, transactionSchema } from '@/schema/schemas'
import { z } from 'zod'

export type TransactionSchemaType = z.infer<typeof transactionSchema>
export type CompanySchemaType = z.infer<typeof companySchema>
export type CurrencySchemaType = z.infer<typeof currencySchema>
export type InitializeSchemaType = z.infer<typeof initializeProducerCompany>
export type ProducerSchemaType = z.infer<typeof producerSchema>
export type PetitionSchemaType = z.infer<typeof petitionSchema>
export type dataToCutSchemaType = z.infer<typeof dataToCutSchema>
