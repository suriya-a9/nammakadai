import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "categories");
const PUBLIC_PREFIX = "/uploads/categories/";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const MIME_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const saveCategoryImage = async (file) => {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size) return null;

  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) {
    throw new Error("Only JPG, PNG, WEBP and GIF images are allowed");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Category image must be 5 MB or smaller");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `${PUBLIC_PREFIX}${filename}`;
};

export const deleteCategoryImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith(PUBLIC_PREFIX)) return;

  const filename = path.basename(imageUrl);
  if (!filename) return;

  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
};

export const readCategoryRequest = async (request) => {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return {
      name: formData.get("name"),
      status: formData.get("status"),
      parent_uuid: formData.get("parent_uuid"),
      image: formData.get("image"),
      remove_image: formData.get("remove_image"),
    };
  }

  return request.json();
};
