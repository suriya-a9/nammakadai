const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value) => UUID_RE.test(String(value || ""));

export const parseProductStatus = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  if (value === false || value === 0 || value === "0" || value === "false") return false;
  return undefined;
};

export const slugifyProductName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";

export const makeProductSlug = (name, uuid) => `${slugifyProductName(name)}-${String(uuid).slice(0, 8)}`;

const numberValue = (value) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const serializeProduct = (product) => {
  const price = numberValue(product.price) ?? 0;
  const salePrice = numberValue(product.salePrice) ?? price;
  const discount = price > 0 && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : 0;
  const galleryRows = Array.isArray(product.images) ? product.images : [];
  const gallery = galleryRows
    .map((image, index) => ({
      id: image.uuid || `${product.uuid}-${index}`,
      uuid: image.uuid || null,
      original_url: image.imageUrl,
      name: product.name,
      sort_order: image.sortOrder ?? index,
      mime_type: null,
    }))
    .filter((image) => image.original_url);

  const fallbackImageUrl = product.imageUrl || "/assets/images/placeholder/product.png";
  if (!gallery.length && fallbackImageUrl) {
    gallery.push({
      id: product.uuid,
      uuid: null,
      original_url: fallbackImageUrl,
      name: product.name,
      sort_order: 0,
      mime_type: null,
    });
  }

  const thumbnail = gallery[0] || { id: product.uuid, original_url: fallbackImageUrl };
  const category = product.category
    ? {
        id: product.category.uuid,
        uuid: product.category.uuid,
        name: product.category.name,
        slug: product.category.uuid,
        status: product.category.status ? 1 : 0,
        parent_id: product.category.parentUuid || null,
        parent_uuid: product.category.parentUuid || null,
      }
    : null;

  const categoryLinks = Array.isArray(product.categoryLinks) ? product.categoryLinks : [];
  const categories = categoryLinks.length ? categoryLinks.map((link) => ({
    id: link.category.uuid, uuid: link.category.uuid, name: link.category.name,
    slug: link.category.uuid, status: link.category.status ? 1 : 0,
    parent_id: link.category.parentUuid || null, parent_uuid: link.category.parentUuid || null,
  })) : category ? [category] : [];
  const productAttributes = {};
  for (const link of product.attributeValues || []) {
    const attribute = link.value.attribute;
    if (!productAttributes[attribute.uuid]) productAttributes[attribute.uuid] = {uuid:attribute.uuid,name:attribute.name,values:[]};
    productAttributes[attribute.uuid].values.push({uuid:link.value.uuid,value:link.value.value});
  }
  const reviewRows = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewsCount = reviewRows.length;
  const ratingCount = reviewsCount ? reviewRows.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewsCount : 0;
  const reviewRatings = [1, 2, 3, 4, 5].map((star) => reviewRows.filter((review) => Number(review.rating) === star).length);
  const reviews = reviewRows.map((review) => ({
    id: review.uuid,
    uuid: review.uuid,
    rating: Number(review.rating),
    description: review.description || "",
    created_at: review.createdAt,
    consumer: { id: review.customer?.uuid, name: review.customer?.name || "Customer", profile_image: null },
  }));

  return {
    id: product.uuid,
    uuid: product.uuid,
    name: product.name,
    slug: product.slug,
    short_description: product.description || "",
    description: product.description || "",
    type: "simple",
    unit: "1 Item",
    weight: null,
    quantity: product.quantity,
    price,
    sale_price: salePrice,
    discount,
    is_featured: 0,
    shipping_days: null,
    is_cod: 1,
    is_free_shipping: 0,
    is_sale_enable: salePrice < price ? 1 : 0,
    is_return: 1,
    is_trending: 0,
    is_approved: 1,
    is_external: 0,
    external_url: null,
    external_button_text: null,
    sale_starts_at: null,
    sale_expired_at: null,
    sku: product.uuid.slice(0, 8).toUpperCase(),
    stock_status: product.quantity > 0 ? "in_stock" : "out_of_stock",
    status: product.status ? 1 : 0,
    product_type: "simple",
    created_at: product.createdAt,
    updated_at: product.updatedAt,
    orders_count: 0,
    reviews_count: reviewsCount,
    rating_count: ratingCount,
    review_ratings: reviewRatings,
    related_products: [],
    cross_sell_products: [],
    wholesales: [],
    variations: [],
    attributes: [],
    tags: [],
    brand: null,
    store: null,
    reviews,
    can_review: true,
    similar_products: [],
    cross_products: [],
    category_uuid: product.categoryUuid,
    categories,
    attributes: Object.values(productAttributes),
    product_thumbnail: thumbnail,
    product_galleries: gallery,
  };
};
