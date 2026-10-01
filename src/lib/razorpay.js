import { createHmac, timingSafeEqual } from "node:crypto";
export function verifySignature(message, signature, secret) {
  if (!signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected=createHmac("sha256",secret).update(message).digest();
  return timingSafeEqual(expected,Buffer.from(signature,"hex"));
}
export async function razorpay(path, options={}) {
  const key=process.env.RAZORPAY_KEY_ID, secret=process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) throw new Error("Razorpay test credentials are not configured");
  const response=await fetch(`https://api.razorpay.com/v1/${path}`,{...options,headers:{Authorization:`Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,"Content-Type":"application/json",...options.headers},cache:"no-store"});
  const data=await response.json();if(!response.ok)throw new Error(data.error?.description||"Razorpay request failed");return data;
}
