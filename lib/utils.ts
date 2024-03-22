import { Transaction } from "@/prisma/generated/client";
import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fetcher(url: string) {
  return axios
    .get(url, {
      withCredentials: true,
    })
    .then((res) => res.data)
}

export function transactionIsCredit(transaction: Transaction, meId: number){
  return (transaction.transmitterId === meId && transaction.income) ||
  (transaction.receiverId===meId && !transaction.income);
}

export function genCode(n : number){
  return String(n).padStart(4, '0')
}