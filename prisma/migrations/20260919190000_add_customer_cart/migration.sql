-- Additive migration. Does not change existing users, products, categories or orders.
CREATE TABLE "customer_cart_items" (
  "uuid" UUID NOT NULL,
  "customer_uuid" UUID NOT NULL,
  "product_uuid" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_cart_items_pkey" PRIMARY KEY ("uuid"),
  CONSTRAINT "customer_cart_items_quantity_check" CHECK ("quantity" >= 1 AND "quantity" <= 100)
);
CREATE UNIQUE INDEX "customer_cart_items_customer_uuid_product_uuid_key" ON "customer_cart_items"("customer_uuid", "product_uuid");
CREATE INDEX "customer_cart_items_customer_uuid_idx" ON "customer_cart_items"("customer_uuid");
ALTER TABLE "customer_cart_items" ADD CONSTRAINT "customer_cart_items_customer_uuid_fkey" FOREIGN KEY ("customer_uuid") REFERENCES "customers"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_cart_items" ADD CONSTRAINT "customer_cart_items_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "products"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "customer_cart_merges" (
  "uuid" UUID NOT NULL,
  "customer_uuid" UUID NOT NULL,
  "merge_key" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_cart_merges_pkey" PRIMARY KEY ("uuid")
);
CREATE UNIQUE INDEX "customer_cart_merges_customer_uuid_merge_key_key" ON "customer_cart_merges"("customer_uuid", "merge_key");
ALTER TABLE "customer_cart_merges" ADD CONSTRAINT "customer_cart_merges_customer_uuid_fkey" FOREIGN KEY ("customer_uuid") REFERENCES "customers"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
