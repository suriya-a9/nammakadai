CREATE TABLE "product_reviews" (
    "uuid" UUID NOT NULL,
    "product_uuid" UUID NOT NULL,
    "customer_uuid" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("uuid")
);
CREATE UNIQUE INDEX "product_reviews_product_uuid_customer_uuid_key" ON "product_reviews"("product_uuid", "customer_uuid");
CREATE INDEX "product_reviews_product_uuid_created_at_idx" ON "product_reviews"("product_uuid", "created_at");
CREATE INDEX "product_reviews_customer_uuid_idx" ON "product_reviews"("customer_uuid");
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "products"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_customer_uuid_fkey" FOREIGN KEY ("customer_uuid") REFERENCES "customers"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
