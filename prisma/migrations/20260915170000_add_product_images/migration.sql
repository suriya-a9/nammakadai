CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "product_images" (
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_uuid" UUID NOT NULL,
  "image_url" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "product_images_pkey" PRIMARY KEY ("uuid")
);

CREATE INDEX IF NOT EXISTS "product_images_product_uuid_sort_order_idx"
  ON "product_images"("product_uuid", "sort_order");

ALTER TABLE "product_images" DROP CONSTRAINT IF EXISTS "product_images_product_uuid_fkey";
ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_product_uuid_fkey"
  FOREIGN KEY ("product_uuid") REFERENCES "products"("uuid")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing single product images as the first gallery image.
INSERT INTO "product_images" ("uuid", "product_uuid", "image_url", "sort_order")
SELECT gen_random_uuid(), p."uuid", p."image_url", 0
FROM "products" p
WHERE p."image_url" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "product_images" pi WHERE pi."product_uuid" = p."uuid"
  );
