"use client";
import { APIGETCutIdResponse } from "@/app/api/admin/cut/[id]/route";
import ContainerCentered from "@/components/ContainerCentered";
import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCutId } from "@/hooks";
import { AxiosError } from "axios";
import moment from "moment";
import { useRouter } from "next/navigation";
import React from "react";

const FieldItem = ({
  label,
  content,
  className,
}: {
  label: string;
  content: string;
  className?: string;
}) => {
  return (
    <div className={className}>
      <span className="text-xs text-muted-foreground leading-none">
        {label}
      </span>
      <br />
      <span className="text-lg leading-4">{content}</span>
    </div>
  );
};

const page = ({ params }: { params: { id: string } }) => {
  const {
    data: cutData,
    isLoading,
    error,
  } = useCutId<APIGETCutIdResponse>(params.id);
  const router = useRouter();

  if (error instanceof AxiosError) {
    if (error.status === 404) {
      return <h1 className="text-2xl text-center mt-12">Cut Not Found</h1>;
    }
    if (error.status === 403) {
      router.push("/");
    }
  }
  if (isLoading) {
    return <Loading />;
  }
  if (cutData) {
    return (
      <ContainerCentered>
        <div>
          <h1 className="text-2xl font-extralight mt-8 mb-3">#{cutData.cut.code}</h1>
        </div>
        <div>
          <h2 className="font-bold text-lg">Details:</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3">
            <FieldItem label="Producer" content={cutData.cut.producer.name} />
            <FieldItem
              label="Balance"
              content={cutData.cut.balance.toFixed(2)}
            />
            <FieldItem
              label="Start"
              content={moment(cutData.cut.startDate).format("LLL")}
            />
            <FieldItem
              label="End"
              content={moment(cutData.cut.endDate).format("LLL")}
            />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg mt-3">Transactions:</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Transmitter</TableHead>
              <TableHead>Receiver</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Factor</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cutData.transactions.map((transac) => (
              <TableRow>
                <TableCell>{transac.id}</TableCell>
                <TableCell>{transac.transmitter.name}</TableCell>
                <TableCell>{transac.receiver.name}</TableCell>
                <TableCell>{moment(transac.updatedAt).format('LLL')}</TableCell>
                <TableCell>{transac.income?'Credit':'Debit'}</TableCell>
                <TableCell>{transac.currencyName}</TableCell>
                <TableCell>{transac.currencyFactor.toFixed(2)}</TableCell>
                <TableCell>{transac.quantity.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ContainerCentered>
    );
  }
};

export default page;
