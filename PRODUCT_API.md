# Product API

Products are stored in PostgreSQL through Prisma. The storefront and admin panel use the same `/api/product` endpoints.

## Price

Product prices are stored directly in INR. The storefront currency exchange rate is `1`, so a database price of `200.00` renders as `₹200.00` instead of being multiplied by the old demo INR rate.

## Product images

Each product can have up to 8 images. Images are stored under `public/uploads/products/` and image records are stored in the `product_images` table.

The first remaining image is used as `product_thumbnail`. All images are returned in `product_galleries`.

## Endpoints

- `GET /api/product` - public product list
- `GET /api/product/:uuid-or-slug` - public product detail
- `POST /api/product` - admin only, multipart form data
- `PATCH /api/product/:uuid` - admin only, multipart form data
- `DELETE /api/product/:uuid` - admin only

Multipart image fields:

- `images` - repeat this field for each new image
- `remove_image_ids` - repeat this field for each existing image UUID to remove

After updating this project run:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```
