CREATE TABLE "product_price_groups" (
 "uuid" UUID NOT NULL, "product_uuid" UUID NOT NULL, "label" VARCHAR(120) NOT NULL,
 "price" DECIMAL(12,2) NOT NULL, "sale_price" DECIMAL(12,2),
 CONSTRAINT "product_price_groups_pkey" PRIMARY KEY ("uuid")
);
CREATE UNIQUE INDEX "product_price_groups_product_uuid_label_key" ON "product_price_groups"("product_uuid", "label");
ALTER TABLE "product_price_groups" ADD CONSTRAINT "product_price_groups_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "products"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "product_variant_options" (
 "uuid" UUID NOT NULL, "product_uuid" UUID NOT NULL, "price_group_uuid" UUID NOT NULL,
 "selection_key" VARCHAR(1000) NOT NULL, "selected_attributes" JSONB NOT NULL,
 CONSTRAINT "product_variant_options_pkey" PRIMARY KEY ("uuid")
);
CREATE UNIQUE INDEX "product_variant_options_product_uuid_selection_key_key" ON "product_variant_options"("product_uuid", "selection_key");
CREATE INDEX "product_variant_options_price_group_uuid_idx" ON "product_variant_options"("price_group_uuid");
ALTER TABLE "product_variant_options" ADD CONSTRAINT "product_variant_options_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "products"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variant_options" ADD CONSTRAINT "product_variant_options_price_group_uuid_fkey" FOREIGN KEY ("price_group_uuid") REFERENCES "product_price_groups"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
