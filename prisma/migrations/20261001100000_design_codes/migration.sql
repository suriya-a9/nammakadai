CREATE TABLE "design_codes" ("uuid" UUID NOT NULL, "code" VARCHAR(80) NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "design_codes_pkey" PRIMARY KEY ("uuid"));
CREATE UNIQUE INDEX "design_codes_code_key" ON "design_codes"("code");
ALTER TABLE "products" ADD COLUMN "design_code_uuid" UUID;
CREATE INDEX "products_design_code_uuid_idx" ON "products"("design_code_uuid");
ALTER TABLE "products" ADD CONSTRAINT "products_design_code_uuid_fkey" FOREIGN KEY ("design_code_uuid") REFERENCES "design_codes"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
