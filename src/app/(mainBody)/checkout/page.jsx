import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { customerFromToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";
import CheckoutContent from "@/components/pages/checkout";
export const dynamic="force-dynamic";
export default async function CheckoutPage(){ const cookieStore=await cookies();const customer=await customerFromToken(cookieStore.get(CUSTOMER_COOKIE)?.value);if(!customer)redirect("/auth/login?next=%2Fcheckout");return <CheckoutContent />;}
