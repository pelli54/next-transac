'use client'

import { fetcher } from "@/lib/utils"
import useSWR from "swr"

export function useTransactions<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/transaction', fetcher)
  return {
    data, isLoading, mutate
  }
}
export function useTransactionsSended<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/transaction/sended', fetcher)
  return {
    data, isLoading, mutate
  }
}
export function useCompanyAll<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/company/getAll', fetcher)
  return {
    data, isLoading, mutate
  }
}
export function useCompany<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/company', fetcher)
  return {
    data, isLoading, mutate
  }
}

export function useProducer<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/producer', fetcher)
  return {
    data, isLoading, mutate
  }
}

export function useCurrency<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/currency', fetcher)
  return {
    data, isLoading, mutate
  }
}
export function usePetition<T>(){
  const {data, isLoading, mutate, error} = useSWR<T>('/api/admin/petition', fetcher,{
    onErrorRetry: (error) => {
      if(error.status === 403){
        return
      }
    }
  })
  return {
    data, isLoading, mutate, error
  }
}
export function usePetitionClient<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/petition/tojoin', fetcher)
  return {
    data, isLoading, mutate
  }
}

export function useDataToCreateTransaction<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/transaction/datatocreate', fetcher)
  return {
    data, isLoading, mutate
  }
}

export function useTransaction<T>(){
  const {data, isLoading, mutate} = useSWR<T>('/api/admin/transaction', fetcher)
  return {
    data, isLoading, mutate
  }
}

export function useCut<T>(){
  const {data, isLoading, mutate, error} = useSWR<T>('/api/admin/cut', fetcher)
  return {
    data, isLoading, mutate, error
  }
}
export function useCutId<T>(id:string){
  const {data, isLoading, mutate, error} = useSWR<T>('/api/admin/cut/'+id, fetcher)
  return {
    data, isLoading, mutate, error
  }
}
