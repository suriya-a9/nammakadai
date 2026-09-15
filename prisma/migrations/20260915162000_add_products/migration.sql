CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "products" (
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(12,2) NOT NULL,
  "sale_price" DECIMAL(12,2),
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "status" BOOLEAN NOT NULL DEFAULT true,
  "image_url" TEXT,
  "category_uuid" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "products_pkey" PRIMARY KEY ("uuid")
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_key" ON "products"("slug");
CREATE INDEX IF NOT EXISTS "products_category_uuid_idx" ON "products"("category_uuid");
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products"("status");
CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products"("created_at");

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_category_uuid_fkey";
ALTER TABLE "products"
  ADD CONSTRAINT "products_category_uuid_fkey"
  FOREIGN KEY ("category_uuid") REFERENCES "categories"("uuid")
  ON DELETE CASCADE ON UPDATE CASCADE;
