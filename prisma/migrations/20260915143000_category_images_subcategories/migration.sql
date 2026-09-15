ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "image_url" TEXT,
  ADD COLUMN IF NOT EXISTS "parent_uuid" UUID;

CREATE INDEX IF NOT EXISTS "categories_parent_uuid_idx" ON "categories"("parent_uuid");

ALTER TABLE "categories"
  DROP CONSTRAINT IF EXISTS "categories_parent_uuid_fkey";

ALTER TABLE "categories"
  ADD CONSTRAINT "categories_parent_uuid_fkey"
  FOREIGN KEY ("parent_uuid") REFERENCES "categories"("uuid")
  ON DELETE CASCADE ON UPDATE CASCADE;
