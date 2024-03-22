"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducer } from "@/hooks";
import { producerSchema } from "@/schema/schemas";
import { ProducerSchemaType } from "@/types/Types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, UserRoundCog } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { Producer } from "@/prisma/generated/client";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useStore } from "@/store/store";
import LoadingIcon from "@/components/LoadingIcon";

const Producer = () => {
  const [currentProducer, setCurrentProducer] = useState<Producer | null>(null);
  const { data: producerList, isLoading, mutate } = useProducer<Producer[]>();
  const form = useForm<ProducerSchemaType>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      companyId: 1,
      active: true,
      name: "",
      role: "",
      userId: 1,
    },
  });
  const loadingSending = useStore((state) => state.loadingSending);
  const setLoadingSending = useStore((state) => state.setLoadingSending);

  const onSelectProducer = (selected: Producer) => {
    setCurrentProducer(selected);
    form.setValue("active", selected.active);
    form.setValue("companyId", selected.companyId);
    form.setValue("name", selected.name);
    form.setValue("role", selected.role);
    form.setValue("userId", selected.userId);
  };

  const onEdit = async (values: ProducerSchemaType) => {
    setLoadingSending(true);
    try {
      const data: ProducerSchemaType = {
        active: values.active,
        companyId: values.companyId,
        name: values.name,
        userId: values.userId,
        role: values.role || "STANDARD",
      };
      const result = await axios.put("/api/admin/producer", data, {
        withCredentials: true,
      });
      if (result.status === 200) {
        toast.success("Producer Updated");
        setCurrentProducer(null);
        form.setValue("active", true);
        form.setValue("companyId", 1);
        form.setValue("name", "");
        form.setValue("role", "");
        form.setValue("userId", 1);
        setLoadingSending(false);
        mutate();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        setLoadingSending(false);
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (producerList) {
    return (
      <div className="border rounded-md p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg">List</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {producerList.map((prod) => (
              <TableRow key={prod.id} onClick={() => onSelectProducer(prod)}>
                <TableCell>
                  {prod.role === "ADMIN" && (
                    <UserRoundCog className="float-left mr-2" />
                  )}
                  {prod.name}
                </TableCell>
                <TableCell>$ {prod.balance?.toFixed(2)}</TableCell>
                <TableCell>{prod.active ? "Active" : "Disable"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {currentProducer !== null && (
          <div className="mt-4">
            <Form {...form}>
              <form
                className="p-3 space-y-4 border rounded-md"
                onSubmit={form.handleSubmit(onEdit)}
              >
                <div className="mb-3">
                  <h2 className="text-lg">Edit</h2>
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
                  name="active"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Active</FormLabel>
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
        )}
      </div>
    );
  }
};

export default Producer;
