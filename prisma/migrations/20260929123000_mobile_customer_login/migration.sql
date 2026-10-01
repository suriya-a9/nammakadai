-- Backup your database and run the preflight checks in MOBILE_WHATSAPP_SETUP.md first.
ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "customers" ALTER COLUMN "password" DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "customers_phone_key" ON "customers"("phone");
