"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useStore } from "@/store/store";
import { Content } from "./Content";


const TransactionDialog = () => {
  const open = useStore((state) => state.openTransaction);
  const setOpen = useStore((state) => state.setOpenTransaction);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent className="max-w-[31rem]">
        <DialogHeader>
          <DialogTitle>Create a new Transaction</DialogTitle>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
