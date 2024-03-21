import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { producerSchema } from "@/schema/schemas";
import { ProducerSchemaType } from "@/types/Types";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useStore } from "@/store/store";
import LoadingIcon from "./LoadingIcon";

export interface ProducerData {
  companyId: number;
  userId: number;
}

const Content = ({ producerData }: { producerData: ProducerData }) => {
  const form = useForm<ProducerSchemaType>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      active: true,
      role: "STANDARD",
      name: "",
      companyId: producerData.companyId,
      userId: producerData.userId,
    },
  });
  const setOpenDialog = useStore((state) => state.setOpenNewProducer);
  const loadingSending = useStore((state) => state.loadingSending);
  const setLoadingSending = useStore((state) => state.setLoadingSending);

  const onSubmit = async (values: ProducerSchemaType) => {
    setLoadingSending(true);
    try {
      const data = {
        name: values.name,
        active: true,
        companyId: producerData.companyId,
        userId: producerData.userId,
        role: "STANDARD",
      };
      const result = await axios.post("/api/admin/producer", data, {
        withCredentials: true,
      });
      if (result.status === 200) {
        toast.success("Producer created");
        setLoadingSending(false);
        setOpenDialog(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setLoadingSending(false);
        toast.error(error.response?.data.message);
      }
    }
  };

  return (
    <div className="p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producer Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Set a Name to the new Producer
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
  );
};

const ProducerDialog = ({
  producerData,
  onOpenChange,
  open,
}: {
  producerData: ProducerData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Producer</DialogTitle>
        </DialogHeader>
        <Content producerData={producerData} />
      </DialogContent>
    </Dialog>
  );
};

export default ProducerDialog;
