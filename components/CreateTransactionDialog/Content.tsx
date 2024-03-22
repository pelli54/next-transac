'use client'
import { DatatoCreateTransaction } from "@/app/api/admin/transaction/datatocreate/route";
import { useDataToCreateTransaction } from "@/hooks";
import { transactionSchema } from "@/schema/schemas";
import { useStore } from "@/store/store";
import { TransactionSchemaType } from "@/types/Types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loading from "../Loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ButtonOptionType } from "./ButtonOptionType";
import { Input } from "../ui/input";
import { ButtonCurrency } from "./ButtonCurrency";
import { ButtonProd } from "./ButtonProd";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

const typeOption = [
  {
    label: "Credito",
    value: 1,
    isIncome: true,
  },
  {
    label: "Debito",
    value: 0,
    isIncome: false,
  },
];

export const Content = () => {
  const form = useForm<TransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      income: true,
      companyId: 0,
      currencyFactor: 0,
      currencyName: "",
      quantity: undefined,
      receiverId: 0,
      transmitterId: 0,
    },
  });
  const { data: toCreateData, isLoading } =
    useDataToCreateTransaction<DatatoCreateTransaction>();
  const isIncome = useStore((state) => state.isIncome);
  const setOpen = useStore((state) => state.setOpenTransaction);
  const isSending = useStore(state => state.loadingSending)
  const setIsSendeing = useStore(state => state.setLoadingSending)

  const onChangeType = (value: boolean) => {
    form.setValue("income", value);
  };

  const onChangeProd = (value: number) => {
    form.setValue("receiverId", value);
  };

  const onChangeCurrency = ({
    factor,
    name,
  }: {
    name: string;
    factor: number;
  }) => {
    form.setValue("currencyFactor", factor);
    form.setValue("currencyName", name);
  };

  const onSubmit = async (values: TransactionSchemaType) => {
    setIsSendeing(true)
    try {
      const data: TransactionSchemaType = {
        companyId: values.companyId,
        currencyFactor: values.currencyFactor,
        currencyName: values.currencyName,
        income: values.income,
        quantity: values.quantity,
        receiverId: values.receiverId,
        transmitterId: values.transmitterId,
      };
      const result = await axios.post("api/admin/transaction", data);
      if (result.status === 200) {
        toast.success("Transaction Sended, wait for approval");
        setOpen(false)
      }
      setIsSendeing(false)
    } catch (error) {
      if(error instanceof AxiosError){
        toast.error(error.response?.data.message)
        setIsSendeing(false)
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  if (toCreateData) {
    if(toCreateData.producer.length===0){
      return <div>
        <h1 className="text-lg mb-1 font-semibold">You dont have another Producer yet</h1>
        <p>To create a new producer must create a nuw User, Log in with the new User, and send a Petition to the company do you want join. The User Admin will receive a petition from the nuw User and this must be Accepted.</p>
      </div>
    }
    console.log(toCreateData)
    form.setValue("income", isIncome);
    form.setValue("transmitterId", toCreateData.myProducer.id);
    form.setValue("companyId", toCreateData.myProducer.companyId);
    form.setValue("receiverId", toCreateData.producer[0].id);
    form.setValue("currencyName", toCreateData.currency[0].name);
    form.setValue("currencyFactor", toCreateData.currency[0].factor);

    return (
      <div className="">
        <Form {...form}>
          <form className="space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
            <h1 className="text-sm mb-2">Select type</h1>
            <ScrollArea className="whitespace-nowrap md:w-[28rem] w-[20rem] ">
              <div className="flex gap-3 pb-2">
                {typeOption.map((t) => (
                  <ButtonOptionType
                    onClick={() => onChangeType(!!t.value)}
                    control={{ ...form.control, name: "income" }}
                    opt={t}
                    key={t.value}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <h1 className="text-sm mb-2">Select destination</h1>
            <ScrollArea className="whitespace-nowrap md:w-[28rem] w-[20rem] ">
              <div className="flex gap-3 pb-2">
                {toCreateData.producer.map((producer) => (
                  <ButtonProd
                    key={producer.id}
                    opt={producer}
                    control={{ ...form.control, name: "receiverId" }}
                    onClick={() => onChangeProd(producer.id)}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <h1 className="text-sm mb-2">Select Currency</h1>
            <ScrollArea className="whitespace-nowrap md:w-[28rem] w-[20rem] ">
              <div className="flex gap-3 pb-1">
                {toCreateData.currency.map((currency) => (
                  <ButtonCurrency
                    key={currency.id}
                    opt={currency}
                    control={{ ...form.control, name: "currencyName" }}
                    onClick={() =>
                      onChangeCurrency({
                        name: currency.name,
                        factor: currency.factor,
                      })
                    }
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            <FormField
              name="quantity"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full md:w-[28rem] ">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button disabled={isSending} className="w-full md:w-[28rem] space-x-3 bg-blue-500 text-white mt-2">
                <Send /> <span>Send</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
};
