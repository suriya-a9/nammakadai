-- Finalize categories to only uuid, name and status, while preserving existing names/statuses
-- if the earlier category migration was already applied.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_parent_id_fkey";

ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "uuid" UUID;
UPDATE "categories" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "categories" ALTER COLUMN "uuid" SET NOT NULL;

DROP INDEX IF EXISTS "categories_slug_key";
DROP INDEX IF EXISTS "categories_parent_id_idx";
DROP INDEX IF EXISTS "categories_type_idx";
DROP INDEX IF EXISTS "categories_status_idx";

ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_pkey";

ALTER TABLE "categories"
  DROP COLUMN IF EXISTS "id",
  DROP COLUMN IF EXISTS "slug",
  DROP COLUMN IF EXISTS "description",
  DROP COLUMN IF EXISTS "image_url",
  DROP COLUMN IF EXISTS "icon_url",
  DROP COLUMN IF EXISTS "type",
  DROP COLUMN IF EXISTS "meta_title",
  DROP COLUMN IF EXISTS "meta_description",
  DROP COLUMN IF EXISTS "parent_id",
  DROP COLUMN IF EXISTS "created_at",
  DROP COLUMN IF EXISTS "updated_at";

ALTER TABLE "categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("uuid");
CREATE INDEX IF NOT EXISTS "categories_status_idx" ON "categories"("status");

CREATE TABLE IF NOT EXISTS "admins" (
  "uuid" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "token" TEXT,
  "token_expires_at" TIMESTAMP(3),
  CONSTRAINT "admins_pkey" PRIMARY KEY ("uuid")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");
