import { create } from "zustand";
import { persist } from "zustand/middleware";


interface state {
  openLaunch: boolean
  openTransaction: boolean
  openNewProducer: boolean
  openToCut: boolean
  isIncome: boolean
  loadingSending: boolean
  onlyAccepted: boolean
}

interface action {
  setOpenLaunch: (state: boolean) => void
  setOpenTransaction: (state: boolean) => void
  setOpenNewProducer: (state: boolean) => void
  setOpenToCut: (state: boolean) => void
  setIsincome: (state: boolean) => void
  setLoadingSending: (state: boolean) => void,
  setOnlyAccepted: (state: boolean) => void
}

export const useStore = create<state & action>()(persist((set) => ({
  openLaunch: false,
  openTransaction: false,
  openNewProducer: false,
  openToCut: false,
  isIncome: false,
  loadingSending: false,
  onlyAccepted: false,
  setOpenLaunch: (state) => set({openLaunch: state}),
  setOpenNewProducer: (state) => set({openNewProducer: state}),
  setOpenTransaction: (state) => set({openTransaction: state}),
  setOpenToCut: (state) => set({openToCut: state}),
  setLoadingSending: (state) => set({loadingSending: state}),
  setIsincome: (state) => set({isIncome: state}),
  setOnlyAccepted: (state) => set({onlyAccepted: state}),
}),{name:'transacLocal'}));
