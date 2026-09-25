# Product attribute purchasing update

This package implements assigned-attribute selection on product detail, separate cart lines for each selection, selection snapshots in checkout/orders, and server-side validation. Stock remains shared at product level.

## Apply to your existing local project
1. Back up PostgreSQL first. Do not run `prisma migrate reset` (it deletes data).
2. Replace your project with these updated files, retaining your `.env.local` and uploaded media.
3. Run `npm install` (the postinstall hook regenerates `src/generated/prisma` from the updated schema).
4. Run `npx prisma db push` against your local development database. Check the printed plan and do not approve any proposed data loss. If your migration history is repaired and fully replayable, you can use the included additive SQL migration instead, but do not apply both paths blindly.
5. Run `npx prisma generate` and `npm run dev`.
6. Test products with zero, one, and multiple assigned attributes, duplicate products with different sizes, quantity changes, guest-cart merge, login, checkout, order details, and low-stock handling before deploying.

**Note:** The ZIP includes generated Prisma code from the uploaded project, which is stale until you regenerate it in step 3/5. No live database or complete Next.js production build was available in this environment. Do not deploy without running the above integration tests.
