import { APIGetProducerResponse } from "@/app/api/admin/producer/route";
import { useProducer } from "@/hooks";
import React from "react";
import Loading from "../Loading";
import { Button } from "../ui/button";
import { useStore } from "@/store/store";
import { User, UserRoundCog } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const Content = () => {
  const { data: producers, isLoading } = useProducer<APIGetProducerResponse>();
  const loadingSending = useStore((state) => state.loadingSending);
  const setLoadingSending = useStore((state) => state.setLoadingSending);
  const setOpen = useStore((state) => state.setOpenToCut);

  const handleClick = async (id: number) => {
    setLoadingSending(true);
    
    try {
      let url = '/api/admin/cut/'
      if(id > 0){
        url = url + String(id) 
      } 
      const result = await axios.post(url)
      if(result.status === 200){
        toast.success('Cut realize')
        setLoadingSending(false);
        setOpen(false)
      } 
    } catch (error) {
      if(error instanceof AxiosError){
        toast.error(error.response?.data.message)
        setLoadingSending(false);
        setOpen(false)
      } 
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  if (producers) {
    return (
      <div>
        <div>
          <Button
            disabled={loadingSending}
            className="w-full bg-blue-500 mb-2 text-white"
            onClick={() => handleClick(0)}
          >
            All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {producers.map((producer) => (
            <Button
              key={producer.id}
              className="flex-col flex h-12 py-1 flex-1"
              variant={"default"}
              onClick={() => handleClick(producer.id)}
            >
              {producer.role === "ADMIN" ? <UserRoundCog /> : <User />}
              <span>{producer.name}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }
};

export default Content;
