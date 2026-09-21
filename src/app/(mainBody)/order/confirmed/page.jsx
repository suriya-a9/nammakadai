import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_COOKIE, customerFromToken } from "@/lib/customerAuth";
import prisma from "@/lib/prisma";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function OrderConfirmed({searchParams}){const jar=await cookies();const customer=await customerFromToken(jar.get(CUSTOMER_COOKIE)?.value);if(!customer)redirect("/auth/login?next=%2Faccount%2Forder");const q=await searchParams;const order=await prisma.order.findFirst({where:{customerUuid:customer.uuid,orderNumber:String(q.order||"")},select:{orderNumber:true,total:true,status:true}});if(!order)redirect("/account/order");return <div className="container section-t-space section-b-space text-center"><div className="theme-card p-5"><h2>Thank you! Your order has been placed.</h2><p>Order number: <strong>{order.orderNumber}</strong></p><h4>Total: ₹{Number(order.total).toFixed(2)}</h4><p>Payment: Cash on Delivery · Order status: {order.status}</p><Link className="btn btn-solid mt-3" href={`/account/order/details/${encodeURIComponent(order.orderNumber)}`}>View order</Link> <Link className="btn mt-3" href="/collections">Continue shopping</Link></div></div>;}
