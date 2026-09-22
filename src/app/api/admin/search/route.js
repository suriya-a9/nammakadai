import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ data: [] });
  const [products, categories, customers, orders] = await Promise.all([
    prisma.product.findMany({ where:{name:{contains:q,mode:"insensitive"}}, take:5, select:{uuid:true,name:true} }),
    prisma.category.findMany({ where:{name:{contains:q,mode:"insensitive"}}, take:5, select:{uuid:true,name:true} }),
    prisma.customer.findMany({ where:{OR:[{name:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{phone:{contains:q}}]}, take:5, select:{uuid:true,name:true,email:true} }),
    prisma.order.findMany({ where:{OR:[{orderNumber:{contains:q,mode:"insensitive"}},{name:{contains:q,mode:"insensitive"}},{phone:{contains:q}}]}, orderBy:{createdAt:"desc"}, take:5, select:{uuid:true,orderNumber:true,name:true} }),
  ]);
  return NextResponse.json({ data:[
    ...orders.map(x=>({id:x.uuid,type:"Order",title:x.orderNumber,subtitle:x.name,href:"/admin/orders"})),
    ...customers.map(x=>({id:x.uuid,type:"Customer",title:x.name,subtitle:x.email,href:"/admin/customers"})),
    ...products.map(x=>({id:x.uuid,type:"Product",title:x.name,subtitle:"Product",href:"/admin/product"})),
    ...categories.map(x=>({id:x.uuid,type:"Category",title:x.name,subtitle:"Category",href:"/admin/category"})),
  ].slice(0,12) });
}
