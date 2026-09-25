ALTER TABLE "customer_cart_items" ADD COLUMN "selection_key" VARCHAR(1000) NOT NULL DEFAULT '', ADD COLUMN "selected_attributes" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "order_items" ADD COLUMN "selected_attributes" JSONB NOT NULL DEFAULT '[]'::jsonb;
DROP INDEX IF EXISTS "customer_cart_items_customer_uuid_product_uuid_key";
CREATE UNIQUE INDEX "customer_cart_items_customer_uuid_product_uuid_selection_key_key" ON "customer_cart_items"("customer_uuid", "product_uuid", "selection_key");
