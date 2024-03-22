import React, { useState } from "react";
import { Card } from "./ui/card";
import {
  Ban,
  CheckCircle,
  User as UserIcon,
  UserPlus,
  UserRoundCog,
  UserX,
  XCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import ProducerDialog, { ProducerData } from "./ProducerDialog";
import { usePetition } from "@/hooks";
import type { Petition, Company, User } from "@/prisma/generated/client";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useStore } from "@/store/store";

const Petition = () => {
  const { data: petitions, isLoading, mutate , error } = usePetition<Array<Petition & { transmitter: User }>>();
  const [producerData, setProducerData] = useState<ProducerData>({
    companyId: 0,
    userId: 0,
  });
  
  const openDialog = useStore(state => state.openNewProducer)
  const setOpenDialog = useStore(state => state.setOpenNewProducer)

  const onAccept = (data: ProducerData) => {
    if(data.companyId === 0 || data.userId === 0){
      return
    }
    setProducerData(data)
    setOpenDialog(true)
  }
  const onDeny = async (petitionId: number) => {
    try {
      const result = await axios.delete('/api/admin/petition/'+petitionId, {withCredentials:true}) 
      if(result.status === 200){
        toast.success('Petition Deny successfully')
        mutate()
      }
    } catch (error) {
      if(error instanceof AxiosError){
        toast.error(error.response?.data.message)
      }
    }
  }

  if (isLoading) {
    return null;
  }
  if(error && error instanceof AxiosError && error.status === 403){
    return null
  }
  if (petitions) {
    const statusFiltered = petitions.filter(
      (petit) => petit.status === "SENDED"
    );
    if (statusFiltered.length === 0) {
      return null;
    }
    return (
      <div>
        <ProducerDialog producerData={producerData} open={openDialog} onOpenChange={(open) => setOpenDialog(open)} />
        <div className="px-3 py-2">
          <h1>Petition</h1>
        </div>
        <hr />
        <div className="p-3">
          {statusFiltered.map((petition) => (
            <Card className="p-3 space-y-3" key={petition.id}>
              <div className="flex items-center space-x-1">
                <h1 className="text-slate-500 dark:text-slate-300">
                  Join the Company
                </h1>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserIcon className="float-left mr-2 size-10" />
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Username
                    </span>
                    <br />
                    <span className="text-xl font-semibold leading-none">
                      {petition.transmitter.username}
                    </span>
                  </div>
                </div>
                <div className="space-x-3">
                  <Button size={"icon"} className=" " onClick={() => onAccept({companyId: petition.companyId, userId: petition.transmitter.id})}>
                    <UserPlus />
                  </Button>
                  <Button size={"icon"} variant={"secondary"} onClick={() => onDeny(petition.id)}>
                    <UserX />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
};

export default Petition;
