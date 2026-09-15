export const parseStatus = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  if (value === false || value === 0 || value === "0" || value === "false") return false;
  return undefined;
};

export const serializeCategory = (category) => {
  const image = category.imageUrl
    ? {
        id: category.uuid,
        original_url: category.imageUrl,
      }
    : null;

  return {
    id: category.uuid,
    uuid: category.uuid,
    name: category.name,
    slug: category.uuid,
    status: category.status ? 1 : 0,
    type: "product",
    parent_id: category.parentUuid || null,
    parent_uuid: category.parentUuid || null,
    image_url: category.imageUrl || null,
    category_image: image,
    category_icon: image,
    subcategories: (category.subcategories || []).map(serializeCategory),
  };
};

export const buildCategoryTree = (rows = []) => {
  const nodes = new Map(
    rows.map((row) => [
      row.uuid,
      {
        ...row,
        subcategories: [],
      },
    ])
  );

  const roots = [];

  nodes.forEach((node) => {
    if (node.parentUuid && nodes.has(node.parentUuid)) {
      nodes.get(node.parentUuid).subcategories.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (items) => {
    items.sort((a, b) => a.name.localeCompare(b.name));
    items.forEach((item) => sortNodes(item.subcategories));
  };

  sortNodes(roots);
  return roots;
};
