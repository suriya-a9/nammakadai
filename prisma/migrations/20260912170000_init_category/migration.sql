CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "icon_url" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "type" VARCHAR(50) NOT NULL DEFAULT 'product',
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "parent_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");
CREATE INDEX "categories_status_idx" ON "categories"("status");
CREATE INDEX "categories_type_idx" ON "categories"("type");

ALTER TABLE "categories"
ADD CONSTRAINT "categories_parent_id_fkey"
FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
