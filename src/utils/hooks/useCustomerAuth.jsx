"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import AccountContext from "@/context/accountContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
const nextLocation=()=>{const raw=new URLSearchParams(window.location.search).get("next")||"/account/dashboard";return raw.startsWith("/")&&!raw.startsWith("//")&&!raw.startsWith("/\\")?raw:"/account/dashboard";};
export default function useCustomerAuth(mode,onError){const [isLoading,setIsLoading]=useState(false);const router=useRouter();const {refetch}=useContext(AccountContext);const {setOpenAuthModal}=useContext(ThemeOptionContext);
 const mutate=async values=>{setIsLoading(true);try{const res=await fetch(`/api/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(values)});const result=await res.json();if(!res.ok)throw new Error(result.message||"Please try again");await refetch();setOpenAuthModal?.(false);router.push(nextLocation());router.refresh();}catch(e){onError?.(e.message);if(!onError)alert(e.message);}finally{setIsLoading(false);}};
 return {mutate,isLoading};}
