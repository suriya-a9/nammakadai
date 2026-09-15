import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const PUBLIC_PREFIX = "/uploads/products/";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 8;

const MIME_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const saveProductImage = async (file) => {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size) return null;
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) throw new Error("Only JPG, PNG, WEBP and GIF images are allowed");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Each product image must be 5 MB or smaller");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `${PUBLIC_PREFIX}${filename}`;
};

export const saveProductImages = async (files = []) => {
  const validFiles = files.filter((file) => file && typeof file.arrayBuffer === "function" && file.size);
  if (validFiles.length > MAX_PRODUCT_IMAGES) throw new Error(`A product can have up to ${MAX_PRODUCT_IMAGES} images`);

  const saved = [];
  try {
    for (const file of validFiles) {
      const url = await saveProductImage(file);
      if (url) saved.push(url);
    }
    return saved;
  } catch (error) {
    await Promise.all(saved.map((url) => deleteProductImage(url)));
    throw error;
  }
};

export const deleteProductImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith(PUBLIC_PREFIX)) return;
  const filename = path.basename(imageUrl);
  if (!filename) return;
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
};

export const deleteProductImages = async (urls = []) => {
  await Promise.all([...new Set(urls.filter(Boolean))].map((url) => deleteProductImage(url)));
};

export const readProductRequest = async (request) => {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const legacyImage = formData.get("image");
    const images = formData.getAll("images").filter((file) => file && typeof file.arrayBuffer === "function" && file.size);
    if (legacyImage && typeof legacyImage.arrayBuffer === "function" && legacyImage.size) images.push(legacyImage);

    return {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      sale_price: formData.get("sale_price"),
      quantity: formData.get("quantity"),
      status: formData.get("status"),
      category_uuid: formData.get("category_uuid"),
      images,
      remove_image_ids: formData.getAll("remove_image_ids").map(String).filter(Boolean),
      remove_image: formData.get("remove_image"),
    };
  }
  const body = await request.json();
  return {
    ...body,
    images: Array.isArray(body.images) ? body.images : [],
    remove_image_ids: Array.isArray(body.remove_image_ids) ? body.remove_image_ids : [],
  };
};
