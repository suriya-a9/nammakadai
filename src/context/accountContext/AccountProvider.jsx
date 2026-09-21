"use client";
import { useCallback, useEffect, useState } from "react";
import AccountContext from ".";
const AccountProvider=({children})=>{
 const [accountData,setAccountData]=useState(null);const [mobileSideBar,setMobileSideBar]=useState(false);const [authLoading,setAuthLoading]=useState(true);
 const refetch=useCallback(async()=>{try{const res=await fetch("/api/self",{credentials:"same-origin",cache:"no-store"});setAccountData(res.ok?await res.json():null);}catch{setAccountData(null);}finally{setAuthLoading(false);}},[]);
 useEffect(()=>{refetch();const onFocus=()=>{void refetch();};window.addEventListener("focus",onFocus);return ()=>window.removeEventListener("focus",onFocus);},[refetch]);
 return <AccountContext.Provider value={{accountData,setAccountData,refetch,authLoading,mobileSideBar,setMobileSideBar}}>{children}</AccountContext.Provider>;
};export default AccountProvider;
