import { isUuid } from "@/lib/product";
export const parseIds = (input) => [...new Set((Array.isArray(input) ? input : []).map(String).filter(isUuid))];
export async function validateAssignments(prisma, categoryIds, valueIds) {
  if (!categoryIds.length) throw new Error("Select at least one category");
  const [categories, values] = await Promise.all([
    prisma.category.count({where:{uuid:{in:categoryIds}}}),
    prisma.attributeValue.findMany({where:{uuid:{in:valueIds}},select:{uuid:true,attributeUuid:true}}),
  ]);
  if (categories !== categoryIds.length) throw new Error("Invalid category selection");
  if (values.length !== valueIds.length) throw new Error("Invalid attribute value selection");
  return true;
}
