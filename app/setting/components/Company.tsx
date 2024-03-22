'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { companySchema } from '@/schema/schemas'
import { CompanySchemaType } from '@/types/Types'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import type { Company } from "@/prisma/generated/client";
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/store'
import LoadingIcon from '@/components/LoadingIcon'


const Company = () => {
  const form = useForm<CompanySchemaType>({
    resolver:zodResolver(companySchema),
    defaultValues:{
      name:''
    }
  })
  const loadingSending = useStore(state => state.loadingSending)
  const setLoadingSending = useStore(state => state.setLoadingSending)

  const onEdit = async (values: CompanySchemaType) => {
    setLoadingSending(true)
    try {
      const data: CompanySchemaType  = {
        name: values.name
      };
      const result = await axios.put("/api/admin/company", data, {
        withCredentials: true,
      });
      if (result.status === 200) {
        toast.success("Company Updated");
        setLoadingSending(false)
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        setLoadingSending(false)
      }
    }
  }

  return (
    <div className='border rounded-md p-3'>
      <div>
        <h2>Change Name</h2>
      </div>
      <div>
        <Form {...form}>
          <form className='space-y-4 mt-3' onSubmit={form.handleSubmit(onEdit)} >
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <Button disabled={loadingSending} >{loadingSending?<LoadingIcon/>:'Save'}</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Company
