"use client";
import { useState } from "react";
import useCustomerAuth from "@/utils/hooks/useCustomerAuth";
export default function MobileLoginForm() {
 const [phone,setPhone]=useState(""); const [error,setError]=useState("");
 const {mutate,isLoading}=useCustomerAuth("login",setError);
 return <form className="theme-form" onSubmit={event=>{event.preventDefault();mutate({phone});}}>
  <label htmlFor="customer-mobile">Mobile number</label>
  <input id="customer-mobile" className="form-control mb-3" type="tel" autoComplete="tel" inputMode="numeric" required pattern="[0-9+ ()-]{10,18}" value={phone} onChange={event=>setPhone(event.target.value)} placeholder="Enter your mobile number" />
  {error && <div role="alert" className="alert alert-danger">{error}</div>}
  <button type="submit" className="btn btn-solid" disabled={isLoading}>{isLoading?"Please wait…":"Continue"}</button>
 </form>;
}
