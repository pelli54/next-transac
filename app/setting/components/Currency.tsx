'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { currencySchema } from '@/schema/schemas'
import { CurrencySchemaType } from '@/types/Types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Home, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Currency } from "@prisma/client";
import { useCurrency } from '@/hooks'
import Loading from '@/components/Loading'
import { Button } from '@/components/ui/button'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { toast } from 'sonner'
import LoadingIcon from '@/components/LoadingIcon'
import { useStore } from '@/store/store'

const Currency = () => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [isNew, setIsnew] = useState<boolean>(false);
  const { data: currencyList, isLoading, mutate } = useCurrency<Currency[]>();
  const form = useForm<CurrencySchemaType>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      companyId:1,
      factor:0,
      main:true,
      name:'',
    },
  });
  const loadingSending = useStore(state => state.loadingSending)
  const setLoadingSending = useStore(state => state.setLoadingSending)


  const onSelectProducer = (selected: Currency) => {
    setCurrentCurrency(selected);
    setIsnew(false)
    form.setValue("factor", selected.factor);
    form.setValue("companyId", selected.companyId);
    form.setValue("name", selected.name);
    form.setValue("main", selected.main);
    form.setValue("id", selected.id);
  };
  const onNew = () => {
    setIsnew(true)
    form.setValue("factor", 0);
    form.setValue("companyId", 1);
    form.setValue("name", '');
    form.setValue("main", true);
  };

  const onSubmit = async (values: CurrencySchemaType) => {
    setLoadingSending(true)
    try {
      let data: CurrencySchemaType = {
        companyId: values.companyId,
        name: values.name,
        main: values.main,
        factor: values.factor
      };
      let result: AxiosResponse | undefined 
      if(isNew){
        result = await axios.post("/api/admin/currency", data, {
          withCredentials: true,
        });
      }else {
        data.id = values.id
        result = await axios.put("/api/admin/currency", data, {
          withCredentials: true,
        });
      }
      if (result?.status === 200) {
        toast.success(isNew?"Producer Created":"Producer Updated");
        setCurrentCurrency(null);
        setIsnew(false)
        form.setValue("companyId", 0);
        form.setValue("name", "");
        form.setValue("factor", 0);
        form.setValue("id", 0);
        form.setValue("main", true);
        mutate()
        setLoadingSending(false)
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        setLoadingSending(false)
      }
    }
  };


  if (isLoading) {
    return <Loading />;
  }

  if(currencyList){
    return (
      <div className='border rounded-md p-3'>
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg">List</h2>
            <Button size={'icon'} onClick={() => onNew()}><Plus/></Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Factor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencyList.map((currency) => (
                <TableRow key={currency.id} onClick={() => onSelectProducer(currency)}>
                  <TableCell>
                    {currency.main && (
                      <Home className="float-left mr-2 h-5" />
                    )}
                    {currency.name}
                  </TableCell>
                  <TableCell>{currency.factor.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(currentCurrency !== null || isNew) && (
            <div className="mt-4">
              <Form {...form}>
                <form className="p-3 space-y-4 border rounded-md" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <h2 className="text-lg">{isNew?'Create':'Edit'}</h2>
                  </div>
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    name="factor"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Factor</FormLabel>
                        <FormControl>
                          <Input {...field} type='number' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button disabled={loadingSending} >{loadingSending?<LoadingIcon/>:'Save'}</Button>
                </form>
              </Form>
            </div>
          )}
      </div>
    )
  }
}

export default Currency