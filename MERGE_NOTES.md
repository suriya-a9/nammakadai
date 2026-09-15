# Merge summary

This project combines the Fashion Five storefront with a focused admin panel in the same Next.js application.

## URLs

- Storefront: `/`
- First admin setup: `/admin/setup`
- Admin login: `/admin/login`
- Admin dashboard: `/admin`
- Category management: `/admin/category`

## Authentication

- Admin signs in with email + password.
- Passwords are stored as bcrypt hashes.
- Login creates a signed JWT with a 1-day expiration.
- The current JWT and its expiry are stored in the `admins` table.
- The browser receives the JWT in an HTTP-only cookie.
- Protected admin pages validate the JWT and the database session.
- Category create/update/delete APIs also require a valid admin session.

## Category database model

The final `categories` table contains exactly:

- `uuid`
- `name`
- `status`

The storefront API derives compatibility values like `id`, `slug`, `type` and empty image/subcategory values without persisting them.

## Install

Because authentication dependencies were added, run `npm install` before Prisma commands. Then run:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

See `ADMIN_SETUP.md` for complete setup steps.
