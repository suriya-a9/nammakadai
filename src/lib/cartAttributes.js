import { isUuid } from "@/lib/product";
export const keyFor = (attributes) => attributes.map(a => a.value_uuid).sort().join(":");
export function normalizeSelection(raw) {
  if (!Array.isArray(raw) || raw.length > 20 || raw.some(a => !isUuid(String(a?.value_uuid || "")))) throw new Error("Invalid product attributes");
  const ids = raw.map(a => String(a.value_uuid));
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate product attributes");
  return ids;
}
export async function validateSelection(db, productUuid, raw) {
  const ids = normalizeSelection(raw || []);
  const links = await db.productAttributeValue.findMany({where:{productUuid},include:{value:{include:{attribute:true}}}});
  const groups = new Map();
  for (const link of links) {
    const a = link.value.attribute;
    if (!groups.has(a.uuid)) groups.set(a.uuid, []);
    groups.get(a.uuid).push(link.value);
  }
  if (ids.length !== groups.size) throw new Error("Select all required product attributes");
  const result = [];
  for (const [attributeUuid, values] of groups) {
    const selected = values.filter(v => ids.includes(v.uuid));
    if (selected.length !== 1) throw new Error("Invalid attribute selection for this product");
    result.push({attribute_uuid:attributeUuid, name:links.find(l=>l.value.attributeUuid===attributeUuid).value.attribute.name, value_uuid:selected[0].uuid, value:selected[0].value});
  }
  return result.sort((a,b)=>a.attribute_uuid.localeCompare(b.attribute_uuid));
}
