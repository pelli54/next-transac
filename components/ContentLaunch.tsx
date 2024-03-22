import { petitionToClient } from "@/app/api/admin/petition/tojoin/route";
import { useCompanyAll, usePetitionClient } from "@/hooks";
import { Company } from "@/prisma/generated/client";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Loading from "./Loading";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { useStore } from "@/store/store";
import LoadingIcon from "./LoadingIcon";

export const ContentLauch = () => {
  const router = useRouter();
  const { data: companies, isLoading } = useCompanyAll<Company[]>();
  const { data: petitions, isLoading: isLoadingPetitions } =
    usePetitionClient<petitionToClient[]>();
  const loadingSending = useStore((state) => state.loadingSending);
  const setLoadingSending = useStore((state) => state.setLoadingSending);

  const { data: userData } = useSession();

  const [inputSelect, setInputSelect] = useState<number | string>("");

  const sendPetition = async () => {
    if (inputSelect === "" || Number.isNaN(Number(inputSelect))) {
      return null;
    }
    if (userData === null) {
      return null;
    }
    setLoadingSending(true);
    try {
      const data = {
        type: "JOINTOCOMPANY",
        companyId: Number(inputSelect),
        transmitterId: Number(userData.user.id),
      };
      const result = await axios.post("/api/admin/petition", data);
      if (result.status === 200) {
        setLoadingSending(false);
        toast.success("Petition Sended, please wait to approval");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setLoadingSending(false);
        toast.error(error.response?.data.message);
      }
    }
  };
  if (isLoading || isLoadingPetitions) {
    return <Loading />;
  }
  if (companies && petitions !== undefined) {
    return (
      <div className="space-y-6 mt-4">
        {petitions.length > 0 && (
          <div className="p-1 rounded-sm dark:bg-sky-800 bg-sky-500  text-center">
            <h1>
              {`Petititon sended to`} <b>{petitions[0].companyName + " "}</b>
              {`${
                petitions[0].status === "SENDED"
                  ? "has not been accepted yet"
                  : petitions[0].status === "DENY"
                  ? "has been rejected"
                  : ""
              }`}
            </h1>
          </div>
        )}
        <div className="flex gap-3">
          <Select onValueChange={setInputSelect} value={String(inputSelect)}>
            <SelectTrigger className="w-full flex-1">
              <SelectValue placeholder="Select a Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            size={"icon"}
            onClick={sendPetition}
            disabled={loadingSending}
          >
            {loadingSending ? <LoadingIcon /> : <Send />}
          </Button>
        </div>
        <div className="flex w-full items-center">
          <div className="flex-1 border-t"></div>
          <div className="px-3">
            <span className="text-muted-foreground">Or</span>
          </div>
          <div className="flex-1 border-t"></div>
        </div>
        <div className="">
          <Button className="w-full" onClick={() => router.push("/start")}>
            Create new Company
          </Button>
        </div>
      </div>
    );
  }
};
