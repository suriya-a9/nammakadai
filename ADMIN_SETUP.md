# NammaKadai Admin + Category Setup

## 1. Database

This merged project uses the same PostgreSQL database for the storefront and admin panel.

Required environment values in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nammakadai?schema=public"
ADMIN_JWT_SECRET="use-a-long-random-secret"
```

## 2. Install and migrate

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

The final `categories` table contains only:

- `uuid` UUID primary key
- `name` varchar
- `status` boolean

The `admins` table contains:

- `uuid`
- `name`
- `email`
- `password` (bcrypt hash, never plain text)
- `token` (current JWT)
- `token_expires_at`

## 3. Create the first admin

Open:

```text
http://localhost:3000/admin/setup
```

The setup route works only when the `admins` table is empty. Enter the admin name, email and password. After creation you are signed in automatically.

Later logins use:

```text
http://localhost:3000/admin/login
```

The JWT expires after 1 day and is also stored in an HTTP-only cookie. Logging out clears the database token and cookie.

## 4. Admin categories

Open:

```text
http://localhost:3000/admin/category
```

You can create, update, activate/deactivate and delete categories. The storefront reads the same records through `GET /api/category`, so active categories appear without a second sync step.

## 5. Category API

Public:

- `GET /api/category`
- `GET /api/category/:uuid`

Admin JWT required:

- `POST /api/category`
- `PUT /api/category/:uuid`
- `PATCH /api/category/:uuid`
- `DELETE /api/category/:uuid`

Create body:

```json
{
  "name": "Sarees",
  "status": 1
}
```

The API derives `slug`, `type` and empty subcategory/image fields only for compatibility with the existing storefront. Those values are not stored in the category table.
