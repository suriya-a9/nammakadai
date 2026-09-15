# Category API

Categories and subcategories are stored in PostgreSQL through Prisma. They use the same `categories` table.

Database fields:

- `uuid`
- `name`
- `status`
- `image_url`
- `parent_uuid` — `NULL` for a main category; contains the parent category UUID for a subcategory.

## Public endpoints

### List

`GET /api/category`

Optional query parameters: `status`, `search`, `page`, `paginate`.

The response contains main categories with nested `subcategories`.

### Get one

`GET /api/category/:uuid`

## Secured admin endpoints

These require the valid admin JWT cookie created by `/api/admin/login`.

### Create category / subcategory

`POST /api/category`

The admin UI sends `multipart/form-data` with:

- `name`
- `status`
- `parent_uuid` (empty for a main category)
- `image` (optional JPG/PNG/WEBP/GIF, max 5 MB)

JSON requests without an image are also still accepted.

### Update

`PUT /api/category/:uuid` or `PATCH /api/category/:uuid`

Supports the same fields as create. Uploading a new image replaces the previous image. `remove_image=1` removes it.

### Delete

`DELETE /api/category/:uuid`

Deleting a main category also deletes its subcategories because the database relation uses cascade delete.

Uploaded category images are stored in `public/uploads/categories`.
