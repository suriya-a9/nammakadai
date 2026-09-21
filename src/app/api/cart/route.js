import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { isUuid, serializeProduct } from "@/lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (message, status = 422) => NextResponse.json({ message }, { status });
const MAX_LINES = 50;
const MAX_QTY = 100;

async function authenticated(request) {
  const customer = await customerFromRequest(request);
  if (!customer) return null;
  // Prevent an in-flight request from a previous login touching a different account.
  const expected = request.headers.get("x-cart-customer");
  if (expected && expected !== customer.uuid) return null;
  return customer;
}

async function loadCart(customerUuid) {
  const rows = await prisma.customerCartItem.findMany({
    where: { customerUuid },
    include: { product: { include: { category: true, images: { orderBy: { sortOrder: "asc" } } } } },
    orderBy: { createdAt: "asc" },
  });
  const data = rows.map(({ uuid, product, quantity }) => {
    const item = serializeProduct(product);
    const price = Number(item.sale_price ?? item.price);
    return { id: uuid, product_id: product.uuid, variation_id: null, variation: null,
      product: item, quantity, sub_total: Math.round(price * quantity * 100) / 100 };
  });
  return NextResponse.json({ data, items: data, total: data.reduce((sum, row) => sum + row.sub_total, 0) },
    { headers: { "Cache-Control": "no-store" } });
}

function parseEntries(raw) {
  if (!Array.isArray(raw) || raw.length > MAX_LINES) throw new Error("Cart has too many products");
  const ids = new Set();
  return raw.map((row) => {
    const productId = String(row?.product_id || "");
    const quantity = Number(row?.quantity);
    if (!isUuid(productId) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QTY || ids.has(productId)) {
      throw new Error("Invalid cart product or quantity");
    }
    ids.add(productId);
    return { productId, quantity };
  });
}

export async function GET(request) {
  const customer = await authenticated(request);
  return customer ? loadCart(customer.uuid) : reply("Customer login required", 401);
}

export async function POST(request) {
  const customer = await authenticated(request);
  if (!customer) return reply("Customer login required", 401);
  try {
    const body = await request.json();
    if (body.action === "merge") {
      const mergeKey = String(body.merge_id || "");
      if (!isUuid(mergeKey)) return reply("Invalid cart merge key");
      const entries = parseEntries(body.items);
      try {
        await prisma.$transaction(async (tx) => {
          // Creating the receipt first makes retries idempotent for this customer.
          await tx.customerCartMerge.create({ data: { customerUuid: customer.uuid, mergeKey } });
          if (!entries.length) return;
          const products = await tx.product.findMany({
            where: { uuid: { in: entries.map((i) => i.productId) }, status: true },
            select: { uuid: true, quantity: true },
          });
          const stockById = new Map(products.map((p) => [p.uuid, p.quantity]));
          const existing = await tx.customerCartItem.findMany({
            where: { customerUuid: customer.uuid, productUuid: { in: entries.map((i) => i.productId) } },
          });
          const current = new Map(existing.map((row) => [row.productUuid, row.quantity]));
          for (const item of entries) {
            const stock = stockById.get(item.productId) ?? 0;
            const quantity = Math.min(MAX_QTY, stock, (current.get(item.productId) || 0) + item.quantity);
            if (quantity < 1) continue;
            await tx.customerCartItem.upsert({
              where: { customerUuid_productUuid: { customerUuid: customer.uuid, productUuid: item.productId } },
              create: { customerUuid: customer.uuid, productUuid: item.productId, quantity },
              update: { quantity },
            });
          }
        });
      } catch (error) {
        // A duplicate receipt means another request already committed the same guest-cart merge.
        if (error?.code !== "P2002") throw error;
      }
      return loadCart(customer.uuid);
    }
    if (body.action === "change") {
      const productId = String(body.product_id || "");
      const delta = Number(body.delta);
      if (!isUuid(productId) || !Number.isSafeInteger(delta) || !delta || delta < -MAX_QTY || delta > MAX_QTY) return reply("Invalid cart change");
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { uuid: productId }, select: { status: true, quantity: true } });
        if (!product || !product.status) throw new Error("This product is no longer available");
        const where = { customerUuid_productUuid: { customerUuid: customer.uuid, productUuid: productId } };
        const existing = await tx.customerCartItem.findUnique({ where, select: { quantity: true } });
        const quantity = (existing?.quantity || 0) + delta;
        if (quantity > Math.min(MAX_QTY, product.quantity)) throw new Error(`Only ${Math.min(MAX_QTY, product.quantity)} items available`);
        if (quantity <= 0) await tx.customerCartItem.deleteMany({ where: { customerUuid: customer.uuid, productUuid: productId } });
        else await tx.customerCartItem.upsert({ where,
          create: { customerUuid: customer.uuid, productUuid: productId, quantity }, update: { quantity } });
      });
      return loadCart(customer.uuid);
    }
    return reply("Invalid cart action");
  } catch (error) {
    if (error instanceof SyntaxError) return reply("Invalid request body");
    if (error.message?.includes("available") || error.message?.includes("Only ") || error.message?.includes("Invalid")) return reply(error.message, 409);
    console.error("cart POST", error);
    return reply("Could not update your cart", 500);
  }
}

export async function PUT(request) {
  const customer = await authenticated(request);
  if (!customer) return reply("Customer login required", 401);
  try {
    const { items } = await request.json();
    const entries = parseEntries(items);
    await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { uuid: { in: entries.map((i) => i.productId) }, status: true },
        select: { uuid: true, quantity: true },
      });
      const stock = new Map(products.map((p) => [p.uuid, p.quantity]));
      if (entries.some((i) => !stock.has(i.productId) || i.quantity > stock.get(i.productId))) throw new Error("A product is unavailable or has insufficient stock");
      await tx.customerCartItem.deleteMany({ where: { customerUuid: customer.uuid } });
      if (entries.length) await tx.customerCartItem.createMany({ data: entries.map((i) => ({ customerUuid: customer.uuid, productUuid: i.productId, quantity: i.quantity })) });
    });
    return loadCart(customer.uuid);
  } catch (error) {
    if (error.message?.includes("Invalid") || error.message?.includes("unavailable") || error.message?.includes("stock") || error.message?.includes("too many")) return reply(error.message, 409);
    console.error("cart PUT", error);
    return reply("Could not replace your cart", 500);
  }
}

export async function DELETE(request) {
  const customer = await authenticated(request);
  if (!customer) return reply("Customer login required", 401);
  const productId = new URL(request.url).searchParams.get("product_id");
  if (productId && !isUuid(productId)) return reply("Invalid product ID");
  await prisma.customerCartItem.deleteMany({ where: { customerUuid: customer.uuid, ...(productId ? { productUuid: productId } : {}) } });
  return loadCart(customer.uuid);
}
