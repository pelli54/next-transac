"use client";
import ContainerCentered from "@/components/ContainerCentered";
import LaunchDialog from "@/components/LaunchDialog";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/utils";
import { useStore } from "@/store/store";
import {
  BarChart2,
  ChevronRight,
  ArrowDownToLine,
  ChevronRightSquare,
  ArrowUpFromLine,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import type { Producer, Company } from "@prisma/client";
import Petition from "@/components/Petition";
import { ContentLauch } from "@/components/ContentLaunch";
import TransactionDialog from "@/components/CreateTransactionDialog/TransactionDialog";
import TransactionSended from "@/components/TransactionSended";
import TransactionList from "@/components/TransactionList";
import ToCutDialog from "@/components/ToCutDialog/ToCutDialog";
import { pusherClient } from "@/pusher/client";

export default function Home() {
  const { status, data } = useSession();
  const router = useRouter();
  const {
    data: producerData,
    isLoading,
    mutate,
  } = useSWR<Producer & { company: Company }>(
    "/api/admin/producer/me",
    fetcher
  );
  const setIsincome = useStore((state) => state.setIsincome);
  const setOpenTransaction = useStore((state) => state.setOpenTransaction);
  const setOpenToCut = useStore((state) => state.setOpenToCut);
  
  const onClickTransac = (isIncome: boolean) => {
    setIsincome(isIncome);
    setOpenTransaction(true);
  };
  const onSignOut = async () => {
    await signOut();
  };

  if (status === "unauthenticated") {
    router.push("/signin");
  }

  if (status === "loading" || isLoading) {
    return <Loading />;
  }
  if (producerData === null && !isLoading) {
    return (
      <ContainerCentered>
        <div className="w-full p-3">
          <div>
            <h1 className="text-xl my-6">You are not in any Company yet</h1>
            <br />
            <span className="">Select the Company to join</span>
          </div>
          <ContentLauch />
        </div>
      </ContainerCentered>
    );
  }

  if (producerData) {
    if(!producerData.active){
      return <ContainerCentered>
        <div className="w-full p-3">
          <div>
            <h1 className="text-xl my-6">Your Producer isn't Active</h1>
            <br />
          </div>
          <div className="space-x-3">
            <Button onClick={() => router.push('/start')}>Create new Company</Button>
            <Button onClick={onSignOut}>Log out</Button>
          </div>
        </div>
      </ContainerCentered>
    }

    const channel = pusherClient.subscribe("company" + producerData.companyId);
    channel.bind("updateTransactions", () => {
      mutate();
    });

    return (
      <ContainerCentered>
        <TransactionDialog />
        <ToCutDialog />

        <div className="p-1 w-full">
          <Card className="w-full px-3 py-2">
            <div className="flex justify-between ">
              <div>
                <span className="text-xs text-muted-foreground ">Balance</span>
                <br />
                <h1 className="text-xl font-semibold">
                  $ {producerData.balance?.toFixed(2)}
                </h1>
              </div>
              <div className="space-x-1">
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => onClickTransac(true)}
                >
                  <ArrowDownToLine />
                </Button>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => onClickTransac(false)}
                >
                  <ArrowUpFromLine />
                </Button>
                {producerData.role === "ADMIN" && (
                  <>
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => setOpenToCut(true)}
                    >
                      <ChevronRightSquare />
                    </Button>
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => router.push("/setting")}
                    >
                      <Settings />
                    </Button>
                  </>
                )}
                <Button onClick={onSignOut} variant={"ghost"} size={'icon'}><LogOut/></Button>
              </div>
            </div>
            <div className="flex justify-between mt-1 items-center">
              <div className="flex gap-1 ">
                <User />
                {producerData.name}
              </div>
              <Button variant={"ghost"} className="px-1 py-0 flex items-center">
                <BarChart2 className="mr-1" />
                <span className="">Movimientos en linea</span>
                <ChevronRight className="ml-2 text-sm" />
              </Button>
            </div>
          </Card>
        </div>
        <Petition />
        <TransactionSended />
        <TransactionList />
      </ContainerCentered>
    );
  }
}
