"use client";
import ContainerCentered from "@/components/ContainerCentered";
import LoadingIcon from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { initializeProducerCompany } from "@/schema/schemas";
import { useStore } from "@/store/store";
import { InitializeSchemaType } from "@/types/Types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const page = () => {
  const router = useRouter();
  const form = useForm<InitializeSchemaType>({
    resolver: zodResolver(initializeProducerCompany),
    defaultValues: {
      companyName: "",
      currencyName: "",
      producerName: "",
    },
  });
  const loadingSending = useStore((state) => state.loadingSending);
  const setLoadingSending = useStore((state) => state.setLoadingSending);

  const onSubmit = async (values: InitializeSchemaType) => {
    setLoadingSending(true)
    try {
      const data = {
        companyName: values.companyName,
        currencyName: values.currencyName,
        producerName: values.producerName,
      };
      const result = await axios.post<{ message: string }>(
        "/api/initialize",
        data,
        {
          withCredentials: true,
        }
      );
      if (result.status === 200) {
        toast.success("Company create Successfully. Returning back...");
        setLoadingSending(false)
        setTimeout(() => router.push("/"), 3000);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setLoadingSending(false)
        toast.error(error.response?.data.message);
      }
    }
  };

  return (
    <ContainerCentered>
      <div className="p-3 text-2xl mt-6 font-extralight">
        <h1>Create New Company</h1>
      </div>
      <div className="p-3">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="companyName"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company, C.A..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="producerName"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Producer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="main cashier..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="currencyName"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bolivares..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Then you can add more coins Curreancy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={loadingSending}>
              {loadingSending ? <LoadingIcon /> : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </ContainerCentered>
  );
};

export default page;
