-- Additive migration; existing administrators, products and categories are retained.
CREATE TABLE "customers" (
 "uuid" UUID NOT NULL, "name" VARCHAR(120) NOT NULL, "email" VARCHAR(255) NOT NULL,
 "password" VARCHAR(255) NOT NULL, "phone" VARCHAR(30), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE TABLE "orders" (
 "uuid" UUID NOT NULL, "order_number" VARCHAR(40) NOT NULL, "customer_uuid" UUID NOT NULL,
 "name" VARCHAR(120) NOT NULL, "phone" VARCHAR(30) NOT NULL, "address" TEXT NOT NULL,
 "city" VARCHAR(120) NOT NULL, "state" VARCHAR(120) NOT NULL, "pincode" VARCHAR(20) NOT NULL,
 "notes" TEXT, "subtotal" DECIMAL(12,2) NOT NULL, "total" DECIMAL(12,2) NOT NULL,
 "status" VARCHAR(30) NOT NULL DEFAULT 'placed', "payment_method" VARCHAR(30) NOT NULL DEFAULT 'cod',
 "payment_status" VARCHAR(30) NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid")
);
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "orders_customer_uuid_created_at_idx" ON "orders"("customer_uuid", "created_at");
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_uuid_fkey" FOREIGN KEY ("customer_uuid") REFERENCES "customers"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE TABLE "order_items" (
 "uuid" UUID NOT NULL, "order_uuid" UUID NOT NULL, "product_uuid" UUID NOT NULL,
 "product_name" VARCHAR(255) NOT NULL, "quantity" INTEGER NOT NULL,
 "unit_price" DECIMAL(12,2) NOT NULL, "line_total" DECIMAL(12,2) NOT NULL,
 CONSTRAINT "order_items_pkey" PRIMARY KEY ("uuid")
);
CREATE INDEX "order_items_order_uuid_idx" ON "order_items"("order_uuid");
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_uuid_fkey" FOREIGN KEY ("order_uuid") REFERENCES "orders"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
