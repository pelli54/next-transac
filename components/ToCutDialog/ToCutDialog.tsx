"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useStore } from "@/store/store";
import Content from "./Content";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const ToCutDialog = () => {
    const open = useStore((state) => state.openToCut);
    const setOpen = useStore((state) => state.setOpenToCut);

  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent className="max-w-[31rem]">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Select the Producer to Cut</DialogTitle> 
          <Button onClick={() => router.push('/cut')} size={'sm'} variant={'link'} >View All Cuts</Button>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
};

export default ToCutDialog;
