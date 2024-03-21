import { CheckCircle, User, UserRoundCog, XCircle } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { useTransactionsSended } from "@/hooks";
import Loading from "./Loading";
import { Producer, Transaction } from "@prisma/client";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useStore } from "@/store/store";
import LoadingIcon from "./LoadingIcon";
import { pusherClient } from "@/pusher/client";
import { APIGETTransactionSendedResponse } from "@/app/api/admin/transaction/sended/route";



const TransactionSended = () => {
  const {
    data: transacSended,
    isLoading,
    mutate,
  } = useTransactionsSended<APIGETTransactionSendedResponse>();

  const loadingSending = useStore((state) => state.loadingSending);
  const setLoadingSending = useStore((state) => state.setLoadingSending);

  const onAccept = async (id: number) => {
    setLoadingSending(true);
    try {
      const result = await axios.put("/api/admin/transaction/" + id);
      if (result.status === 200) {
        setLoadingSending(false);
        toast.success("Accepted");
        mutate();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setLoadingSending(false);
        toast.error(error.response?.data.message);
      }
    }
  };

  const onDeny = async (id: number) => {
    setLoadingSending(true);
    try {
      const result = await axios.delete("/api/admin/transaction/" + id);
      if (result.status === 200) {
        setLoadingSending(false);
        toast.success("Deny");
        mutate();
      }
    } catch (error) {
      setLoadingSending(false);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  if (transacSended) {
    const channel = pusherClient.subscribe("company" + transacSended.companyId);
    channel.bind("updateTransactions", () => {
      mutate();
    });
    if (transacSended.transactions.length === 0) {
      return null;
    }

    return (
      <div>
        <div className="px-3 py-2">
          <h1>Request Received</h1>
        </div>
        <hr />
        <div className="p-3 space-y-3">
          {transacSended.transactions.map((transac) => (
            <Card className="p-3 space-y-3" key={transac.id}>
              <div className="flex items-center space-x-1">
                <div
                  className={cn(
                    "py-1 px-2 rounded-xl mr-3",
                    transac.income ? "bg-red-400" : "bg-green-400"
                  )}
                >
                  {transac.income ? "Debit" : "Credit"}
                </div>
                <h1 className="text-slate-500 dark:text-slate-300">
                  {transac.transmitter.role === "ADMIN" ? (
                    <UserRoundCog className="float-left mr-1" />
                  ) : (
                    <User className="float-left mr-1" />
                  )}
                  {transac.transmitter.name}
                </h1>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className={cn(
                      "text-xl font-semibold",
                      transac.income ? "text-red-400" : "text-green-300"
                    )}
                  >
                    {transac.income ? "- " : "+ "}
                    {transac.quantity.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      transac.income ? "text-red-400" : "text-green-300"
                    )}
                  >
                    {" (" + transac.currencyName + ")"}
                  </span>
                </div>
                <div className="space-x-3">
                  {loadingSending && <LoadingIcon />}
                  {!loadingSending && (
                    <>
                      <Button
                        onClick={() => onAccept(transac.id)}
                        size={"icon"}
                        className="bg-green-400 hover:bg-green-300 "
                      >
                        <CheckCircle />
                      </Button>
                      <Button
                        onClick={() => onDeny(transac.id)}
                        size={"icon"}
                        className="bg-red-400 hover:bg-red-300"
                      >
                        <XCircle />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
};

export default TransactionSended;
