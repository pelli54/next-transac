import { useTransaction } from "@/hooks";
import {
  CheckCheck,
  ChevronRight,
  CornerRightDown,
  CornerUpLeft,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import Loading from "./Loading";
import moment from "moment";
import { cn, transactionIsCredit } from "@/lib/utils";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useStore } from "@/store/store";
import { pusherClient } from "@/pusher/client";
import { Producer, Transaction } from "@prisma/client";

type TransactionExtend = Transaction & {
  receiver: Producer;
  transmitter: Producer;
};
interface GetTransactionFromAPI {
  transactions: TransactionExtend[];
  me: Producer;
}

//ITEM
const TransactionItem = ({
  transaction,
  me,
}: {
  transaction: TransactionExtend;
  me: Producer;
}) => {
  const isCredit = transactionIsCredit(transaction, me.id);
  const isFromMe = transaction.transmitterId === me.id; 
  const isAdmin = me.role === "ADMIN";
  const receiverName = transaction.receiver.name;
  const transmitterName = transaction.transmitter.name;

  const status =
    transaction.status === "SENDED" ? (
      <div className="flex gap-1 text-xs">
        <CheckCheck className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">Sended</span>
      </div>
    ) : transaction.status === "ACCEPTED" ? (
      <div className="flex gap-1 text-xs">
        <CheckCheck className="text-blue-400 size-4" />
        <span className="text-muted-foreground">Accepted</span>
      </div>
    ) : transaction.status === "DENY" ? (
      <div className="flex gap-1 text-xs ">
        <X className="size-4 text-red-600" />{" "}
        <span className="text-red-600">Deny</span>
      </div>
    ) : null;
  return (
    <div className="flex border-b pt-2 pb-3">
      <div
        className={cn(
          "mr-4",
          transaction.status === "ACCEPTED" ? "" : "text-muted-foreground"
        )}
      >
        {isCredit ? <CornerRightDown /> : <CornerUpLeft />}
      </div>
      <div className="flex-1">
        <div
          className={cn(
            "flex justify-between",
            transaction.status === "ACCEPTED" ? "" : "text-muted-foreground"
          )}
        >
          <div className="flex gap-1">
            {isFromMe ? <User /> : <h1>{transmitterName}</h1>}
            <ChevronRight />
            {isFromMe ? <h1>{receiverName}</h1> : <User />}
          </div>
          <span className="font-semibold text-right leading-none text-lg">
            {isCredit ? "+" : "-"}
            {transaction.quantity.toFixed(2)}{" "}
            <small>{`(${transaction.currencyName})`}</small>
          </span>
        </div>
        <div className="flex justify-between ">
          {status}
          <p className="leading-none text-muted-foreground text-sm text-right w-full">
            {moment(transaction.updatedAt).calendar()}
          </p>
        </div>
      </div>
    </div>
  );
};

//LIST
const TransactionList = () => {
  const {
    data: transactionsData,
    isLoading,
    mutate,
  } = useTransaction<GetTransactionFromAPI>();
  const onlyAccepted = useStore((state) => state.onlyAccepted);
  const setOnlyAccepted = useStore((state) => state.setOnlyAccepted);

  if (isLoading) {
    return <Loading />;
  }
  if (transactionsData) {
    const channel = pusherClient.subscribe(
      "company" + transactionsData.me.companyId
    );
    channel.bind("updateTransactions", () => {
      mutate();
    });

    return (
      <div>
        <div className="px-3 py-2 flex justify-between">
          <h1 className="font-semibold">Movements</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="onlyaccepted">Only Accept</Label>
            <Switch
              checked={onlyAccepted}
              onCheckedChange={setOnlyAccepted}
              id="onlyaccepted"
            />
          </div>
        </div>
        <hr />
        <div className="space-y-3 p-3">
          {transactionsData.transactions
            .filter((t) => (onlyAccepted ? t.status === "ACCEPTED" : true))
            .map((transaction) => (
              <TransactionItem
                key={transaction.id}
                me={transactionsData.me}
                transaction={transaction}
              />
            ))}
        </div>
      </div>
    );
  }
};

export default TransactionList;
