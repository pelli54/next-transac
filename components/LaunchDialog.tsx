"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useStore } from "@/store/store";
import { ContentLauch } from "./ContentLaunch";


const LaunchDialog = () => {
  const { openLaunch, setOpenLaunch } = useStore();
  return (
    <Dialog open={openLaunch} onOpenChange={(open) => setOpenLaunch(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select your Company</DialogTitle>
        </DialogHeader>
        <ContentLauch />
      </DialogContent>
    </Dialog>
  );
};

export default LaunchDialog;
