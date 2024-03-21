"use client";
import ContainerCentered from "@/components/ContainerCentered";
import { useCut } from "@/hooks";
import React, { useReducer } from "react";
import { APIGetCutResponse } from "../api/admin/cut/route";
import Loading from "@/components/Loading";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import moment from "moment";

const page = () => {
  const { data: cuts, isLoading, error } = useCut<APIGetCutResponse>();
  const router = useRouter();

  if (error instanceof AxiosError && error.status === 403) {
    router.push("/");
  }
  if (isLoading) {
    return <Loading />;
  }
  if (cuts) {
    return (
      <ContainerCentered>
        <div className="w-full">
          <h1 className="text-2xl font-extralight my-6 px-3">Cut</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Producer</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cuts.map((cut) => (
              <TableRow className="border-b p-3" key={cut.id}>
                <TableCell className="font-bold">#{cut.code}</TableCell>
                <TableCell className="">{cut.producer.name}</TableCell>
                <TableCell className="">{moment(cut.startDate).format('LLL')}</TableCell>
                <TableCell className="">{moment(cut.endDate).format('LLL')}</TableCell>
                <TableCell className="">$ {cut.balance.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ContainerCentered>
    );
  }
};

export default page;
