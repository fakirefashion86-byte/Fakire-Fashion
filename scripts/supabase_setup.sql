-- ============================================================================
-- Fakire Fashion — full Supabase setup script
-- ============================================================================
-- Run this ONCE, top to bottom, in the Supabase SQL Editor (Project → SQL
-- Editor → New query) against a brand-new project. It creates the entire
-- schema and seeds starter data (categories, sample products, stitch
-- categories, one admin account, one tailor account) — equivalent to running
-- `prisma migrate deploy` + `prisma db seed` locally, but as plain SQL.
--
-- Safe to run only on an EMPTY database — it will error on tables that
-- already exist. If you need to re-run it, drop the tables first or use a
-- fresh Supabase project.
-- ============================================================================


-- ============================================================================
-- PART 1: SCHEMA
-- ============================================================================

CREATE TYPE "Role" AS ENUM ('customer', 'admin', 'tailor');
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE "StitchStatus" AS ENUM ('not_started', 'pending', 'stitched', 'out_for_delivery', 'delivered');

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "mobile" TEXT,
    "address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'customer',
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sub_categories" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subCategoryId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "mrp" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "shippingCharges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "productName" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "qty" INTEGER NOT NULL,
    "color" TEXT,
    "size" TEXT,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stitch_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    CONSTRAINT "stitch_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stitch_orders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stitchCategoryId" INTEGER NOT NULL,
    "measurements" JSONB NOT NULL,
    "suitImage" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerMobile" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "status" "StitchStatus" NOT NULL DEFAULT 'not_started',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stitch_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enquiries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coupons" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_content" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_content_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "sub_categories_categoryId_slug_key" ON "sub_categories"("categoryId", "slug");
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
CREATE UNIQUE INDEX "product_variants_productId_size_color_key" ON "product_variants"("productId", "size", "color");
CREATE UNIQUE INDEX "cart_items_userId_productId_variantId_key" ON "cart_items"("userId", "productId", "variantId");
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stitch_orders" ADD CONSTRAINT "stitch_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stitch_orders" ADD CONSTRAINT "stitch_orders_stitchCategoryId_fkey" FOREIGN KEY ("stitchCategoryId") REFERENCES "stitch_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "wishlist_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON "wishlist_items"("userId", "productId");

ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ============================================================================
-- PART 2: SEED DATA
-- ============================================================================
-- Categories match the current site: Women and Men only (no Kids/Accessories).
-- No customer PII is seeded — only structure + a few sample products so the
-- storefront isn't empty on first deploy.

DO $$
DECLARE
  women_id INT;
  men_id   INT;
BEGIN
  INSERT INTO categories (name, slug, status) VALUES ('Women', 'women', true) RETURNING id INTO women_id;
  INSERT INTO categories (name, slug, status) VALUES ('Men', 'men', true) RETURNING id INTO men_id;

  INSERT INTO sub_categories ("categoryId", name, slug) VALUES
    (women_id, 'Suits', 'suits'),
    (women_id, 'Kurtis', 'kurtis'),
    (women_id, 'Sarees', 'sarees'),
    (women_id, 'Ethnic Wear', 'ethnic-wear'),
    (women_id, 'Lehenga Cholis', 'lehenga-cholis'),
    (women_id, 'Dresses', 'dresses'),
    (women_id, 'Dupattas & Shawls', 'dupattas-shawls'),
    (women_id, 'Chikan Suits', 'chikan-suits'),
    (men_id, 'Kurta Pajama', 'kurta-pajama'),
    (men_id, 'Shirts', 'shirts'),
    (men_id, 'Pants', 'pants'),
    (men_id, 'Coats', 'coats'),
    (men_id, 'Waistcoats', 'waistcoats'),
    (men_id, 'Pathani Suits', 'pathani-suits');
END $$;

DO $$
DECLARE
  women_id INT := (SELECT id FROM categories WHERE slug = 'women');
  men_id   INT := (SELECT id FROM categories WHERE slug = 'men');
  suits_id       INT := (SELECT id FROM sub_categories WHERE slug = 'suits' AND "categoryId" = women_id);
  kurtis_id      INT := (SELECT id FROM sub_categories WHERE slug = 'kurtis' AND "categoryId" = women_id);
  sarees_id      INT := (SELECT id FROM sub_categories WHERE slug = 'sarees' AND "categoryId" = women_id);
  kurta_pajama_id INT := (SELECT id FROM sub_categories WHERE slug = 'kurta-pajama' AND "categoryId" = men_id);
  pathani_id     INT := (SELECT id FROM sub_categories WHERE slug = 'pathani-suits' AND "categoryId" = men_id);
  waistcoat_id   INT := (SELECT id FROM sub_categories WHERE slug = 'waistcoats' AND "categoryId" = men_id);
  p_id INT;
BEGIN
  INSERT INTO products ("categoryId", "subCategoryId", name, code, description, mrp, price, status)
    VALUES (women_id, suits_id, 'Anarkali Suit', 'SAMPLE-AN01', 'Party wear Anarkali suit with embroidered neckline.', 2599, 1999, true) RETURNING id INTO p_id;
  INSERT INTO product_variants ("productId", size, color, mrp, price, qty) VALUES
    (p_id, '38', 'Default', 2599, 1999, 10), (p_id, '40', 'Default', 2599, 1999, 10);

  INSERT INTO products ("categoryId", "subCategoryId", name, code, description, mrp, price, status)
    VALUES (women_id, kurtis_id, 'Chikankari Kurti', 'SAMPLE-CK01', 'Hand-embroidered chikankari kurti.', 1899, 1499, true) RETURNING id INTO p_id;
  INSERT INTO product_variants ("productId", size, color, mrp, price, qty) VALUES
    (p_id, '38', 'Default', 1899, 1499, 10), (p_id, '40', 'Default', 1899, 1499, 10);

  INSERT INTO products ("categoryId", "subCategoryId", name, code, description, mrp, price, status)
    VALUES (women_id, sarees_id, 'Designer Saree', 'SAMPLE-SR01', 'Festive-wear saree with contrast blouse piece.', 3499, 2799, true) RETURNING id INTO p_id;
  INSERT INTO product_variants ("productId", size, color, mrp, price, qty) VALUES
    (p_id, '38', 'Default', 3499, 2799, 10), (p_id, '40', 'Default', 3499, 2799, 10);

  INSERT INTO products ("categoryId", "subCategoryId", name, code, description, mrp, price, status)
    VALUES (men_id, kurta_pajama_id, 'Kurta Pajama Set', 'SAMPLE-KP01', 'Classic cotton kurta pajama set.', 1699, 1299, true) RETURNING id INTO p_id;
  INSERT INTO product_variants ("productId", size, color, mrp, price, qty) VALUES
    (p_id, '38', 'Default', 1699, 1299, 10), (p_id, '40', 'Default', 1699, 1299, 10);

  INSERT INTO products ("categoryId", "subCategoryId", name, code, description, mrp, price, status)
    VALUES (men_id, pathani_id, 'Pathani Suit', 'SAMPLE-PS01', 'Comfortable everyday Pathani suit.', 1999, 1599, true) RETURNING id INTO p_id;
  INSERT INTO product_variants ("productId", size, color, mrp, price, qty) VALUES
    (p_id, '38', 'Default', 1999, 1599, 10), (p_id, '40', 'Default', 1999, 1599, 10);

  INSERT INTO products ("categoryId", "subCategoryId", name, code, description, mrp, price, status)
    VALUES (men_id, waistcoat_id, 'Nehru Waistcoat', 'SAMPLE-WC01', 'Festive Nehru-style waistcoat.', 1499, 1199, true) RETURNING id INTO p_id;
  INSERT INTO product_variants ("productId", size, color, mrp, price, qty) VALUES
    (p_id, '38', 'Default', 1499, 1199, 10), (p_id, '40', 'Default', 1499, 1199, 10);
END $$;

INSERT INTO stitch_categories (name) VALUES
  ('Kurta Pajama'),
  ('Salwar Suit'),
  ('Coat & Pant'),
  ('Blazer'),
  ('Pathani Suit'),
  ('Three Piece Suit');

-- Admin account:    admin@fakirefashion.local / N0xat2w8rZML!x2
-- Tailor account:   tailor@fakirefashion.local / 4dqyRbxnNXgA!x2
-- Customer account: customer@fakirefashion.local / Customer123!
-- All passwords are already bcrypt-hashed below. CHANGE THESE before going
-- live — see scripts/set-staff-accounts.sql for how to rotate them later.
INSERT INTO users (name, email, "passwordHash", role, approved, mobile, address) VALUES
  ('Admin', 'admin@fakirefashion.local', '$2b$10$4WjIrVqdEIrhV0Wfhuomw.vczDZ0lE5Wwq6O8YlPsWI5p3W1qKg2q', 'admin', true, NULL, NULL),
  ('Tailor', 'tailor@fakirefashion.local', '$2b$10$lN2KEaBipuE.SvuV23UN0OHjqu./eiCj3cHxgbZxn8HX8dzuMUBjW', 'tailor', true, NULL, NULL),
  ('Test Customer', 'customer@fakirefashion.local', '$2b$10$5OjoUh5a/T5LQOtbVtX1r.ymsJgDv8xP37Fw2bOulZxhbRDGRxWru', 'customer', true, '9999999999', '123 Sample Street, Test City, 000000');

-- Optional: homepage hero/CTA content. Skip this if you're fine with the
-- built-in defaults (src/lib/siteContent.ts) — the site works without this row.
INSERT INTO site_content (key, data) VALUES (
  'homepage',
  '{
    "heroBadge": "Premium Fabrics. Perfect Fit.",
    "heroHeading": "Ethnic Wear, Tailored For",
    "heroHeadingAccent": "You",
    "heroSubheading": "Experience the perfect blend of tradition and style. Custom tailored ethnic wear for every occasion.",
    "heroImageUrl": "/images/Sherwani_Hero.png",
    "ctaHeading": "Your Style, Your Fit.\nTailored To Perfection.",
    "ctaButtonText": "Book Appointment"
  }'::jsonb
);
