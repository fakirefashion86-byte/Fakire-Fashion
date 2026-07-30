# Fakire Fashion — Tailor Shop (React rebuild)

A rebuild of the legacy PHP "Fakire Fashion / Zainaz" tailor shop as a Next.js + Prisma + Postgres app, meant to run on **Vercel (frontend + API) + Supabase (database)** with a custom domain.

## Stack

- **Next.js 16 (App Router, TypeScript)** — pages and API routes in one deployable app
- **Prisma 6** — ORM, talking to Postgres
- **Postgres via Supabase** — the only external service required besides Vercel
- **Custom auth** — bcrypt password hashing + JWT in an httpOnly cookie (no third-party auth provider)
- **No payment gateway yet** — checkout places orders as Cash on Delivery / "Pending". Razorpay (or another gateway) can be added later inside `src/app/checkout` and `src/app/api/orders` without restructuring anything else.

## What's included

- Storefront: categories → subcategories → products with size/color variants
- Cart, checkout (no payment), order history + status tracking
- Custom tailoring flow: pick a garment type, submit measurements, track stitching status
- Contact form
- Static pages: About, Privacy Policy, Terms, Shipping Policy, Cancellation & Refund, Size Guide
- Three account roles:
  - **Customer** — self-registers at `/register`, no approval needed
  - **Tailor** — self-signs up at `/tailor/signup`, account stays locked out (`approved: false`) until an admin approves it in `/admin/tailors`; once approved, logs in at `/tailor/login` to a dashboard scoped to viewing/updating stitching orders only
  - **Admin** — *not* self-service by design (see Security note below); provisioned via `scripts/set-staff-accounts.sql` or `.ts`
- `/admin` "Control Centre": dashboard, product/category management, order + stitch-order status updates, a **Customers** section (list + per-customer order/stitch-order history), a **Tailors** section (approve/revoke/reject), and a **Site Content** editor for the homepage hero/CTA copy and hero image — no code changes needed to update that copy
- Account page (`/account`) includes a change-password form (requires current password; there's no email-based "forgot password" flow since no email service is configured)

There are no product/category images shipped in the repo. The legacy site's own image files turned out to be either unrelated stock photos or marketing banners with prices baked into the graphic — unsafe to reuse — so product pages show a placeholder until real photos are uploaded via the admin panel. The homepage hero photo (`public/images/Sherwani_Hero.png`) is editable from `/admin/content`. See `prisma/seed.ts` for the only data that gets seeded (category taxonomy + a handful of sample products + one admin account, no customer PII).

### Security note on the Tailor/Admin approval flow

Tailors get a public signup form gated by admin approval. Admin accounts deliberately do **not** have a public signup form — allowing anyone to request full site control is a real risk. If you want a public "request admin access" flow later, treat it as a separate, carefully-reviewed change, not a copy-paste of the tailor flow.

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Get a Postgres database

Either:
- **Supabase** (recommended, matches production): create a project at supabase.com, then copy the connection string from Project Settings → Database → Connection string (use the "Transaction" pooler URL for `DATABASE_URL` if deploying to serverless/Vercel).
- **Local Postgres via Docker** (used to build/verify this project):
  ```bash
  docker run -d --name tailor-shop-pg -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=tailorshop -p 55432:5432 postgres:16-alpine
  ```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
JWT_SECRET="a-long-random-string"
```

Generate a strong `JWT_SECRET` with `openssl rand -base64 32`.

### 4. Run migrations + seed data

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

The seed script creates:
- Category/subcategory taxonomy (Women, Men + their subcategories)
- A handful of sample products so the storefront isn't empty
- Stitching categories (Kurta Pajama, Salwar Suit, Coat & Pant, Blazer, Pathani Suit, Three Piece Suit)
- One admin account — override the default via `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` env vars before seeding, or change it later from `/account` (logged in) or `scripts/set-staff-accounts.sql`.

For Supabase specifically, `scripts/supabase_setup.sql` is a self-contained alternative to the two commands above — see the deployment section below.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. Admin panel: `http://localhost:3000/admin/login`.

## Deploying to production

### 1. Supabase (database)

1. Create a Supabase project.
2. Grab the pooled connection string (Project Settings → Database → Connection Pooling, "Transaction" mode) — serverless functions on Vercel need pooled connections, not a direct one. This is your `DATABASE_URL`.
3. Set up the schema + starter data — two options:
   - **SQL Editor (no local setup needed)**: open `scripts/supabase_setup.sql`, paste its entire contents into Supabase's SQL Editor, and run it once. Creates every table and seeds categories/sample products/stitch categories/one admin account/one tailor account in a single pass.
   - **Prisma CLI**: `npx prisma migrate deploy` against the Supabase connection string, then `npx prisma db seed`.
4. Change the seeded admin/tailor passwords before going live (see `scripts/set-staff-accounts.sql`).

### 2. Vercel (frontend + API)

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Set environment variables in the Vercel project settings:
   - `DATABASE_URL` — the Supabase pooled connection string
   - `JWT_SECRET` — a strong random value (different from local dev)
4. Deploy. Vercel runs `npm run build` automatically.

### 3. Custom domain

In the Vercel project → Settings → Domains, add your domain and follow the DNS instructions it gives you (usually an `A`/`CNAME` record at your registrar).

## Project structure

```
prisma/schema.prisma       Database schema
prisma/seed.ts             Starter data (taxonomy, sample products, admin user)
src/lib/prisma.ts          Prisma client singleton
src/lib/auth.ts            Password hashing, JWT session cookie helpers
src/middleware.ts          Lightweight route-guard (redirects unauthenticated users)
src/app/                   Pages (storefront, account, admin) and API routes
src/components/            Shared UI + admin components
public/images/legacy/      Legacy site's generic marketing/stock images
public/images/slider/      Legacy hero/category images
```

## Known gaps / next steps

- No payment gateway — checkout is Cash-on-Delivery only for now.
- No image upload — admin product creation takes an image URL, not a file upload.
- No password reset flow.
- Admin panel covers products/categories/orders/stitch-orders; it does not yet manage coupons or enquiries (both have DB models and can be surfaced later).
