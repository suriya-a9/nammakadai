# Fix: Unknown argument customerUuid_productUuid_selectionKey

Your uploaded source `prisma/schema.prisma` and cart API ALREADY use the new three-column unique key. The uploaded `src/generated/prisma` client is OLD: it still exposes only `customerUuid_productUuid`. Your local database may also be on the old schema. Both must match the source schema.

## On your Windows development machine (PowerShell)

1. **Back up your PostgreSQL database** before any schema changes.
2. Stop the Next.js development server (Ctrl+C).
3. In `E:\Nammakadai`, check that `.env.local` points to the **correct development database**.
4. Run:

```powershell
cd E:\Nammakadai
npx prisma validate
npx prisma db push
npx prisma generate
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

`prisma db push` must be run against your intended LOCAL DEVELOPMENT database. Inspect any proposed destructive changes and do not accept data loss. Do not run `prisma migrate reset`.

**Do not manually add fields if `db push` succeeds.** Your source schema already defines:
- `customer_cart_items.selection_key` VARCHAR(1000) NOT NULL DEFAULT ''
- `customer_cart_items.selected_attributes` JSONB NOT NULL DEFAULT '[]'
- `order_items.selected_attributes` JSONB NOT NULL DEFAULT '[]'
- unique index on `(customer_uuid, product_uuid, selection_key)` (replaces old two-column unique index)

The ZIP includes an additive SQL migration in `prisma/migrations/20260925150000_cart_attribute_selections/migration.sql`. If you have a healthy migration history and that migration has not been applied, your team may apply it with your normal migration workflow INSTEAD of `db push`. Your project also contains older migration-order issues; do not run `migrate reset` to resolve them.

## Verify PostgreSQL columns and index

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name IN ('customer_cart_items','order_items')
AND column_name IN ('selection_key','selected_attributes');

SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'customer_cart_items';
```

## Verify Prisma client was regenerated

In `src/generated/prisma/models/CustomerCartItem.ts`, search for `customerUuid_productUuid_selectionKey`. It must appear after `npx prisma generate`. If not, check the generate command output and confirm you are running commands from the correct project directory.

If your database already has the new columns and index, only `npx prisma generate` and clearing `.next` may be necessary.
