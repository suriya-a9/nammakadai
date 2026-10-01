import { keyFor } from "@/lib/cartAttributes";

export async function priceForSelection(db, product, attributes) {
  const hasVariants = await db.productVariantOption.count({where:{productUuid:product.uuid}});
  if (!hasVariants) return {price:Number(product.salePrice ?? product.price), regularPrice:Number(product.price), variantUuid:null};
  const option = await db.productVariantOption.findUnique({
    where:{productUuid_selectionKey:{productUuid:product.uuid,selectionKey:keyFor(attributes)}},
    include:{priceGroup:true},
  });
  if (!option) throw new Error("This measurement combination is unavailable. Please reselect your product.");
  return {price:Number(option.priceGroup.salePrice ?? option.priceGroup.price),regularPrice:Number(option.priceGroup.price),variantUuid:option.uuid};
}
