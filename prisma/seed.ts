import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  // --- Categories & subcategories (real taxonomy, no customer PII) ---
  const categoryDefs: { name: string; subCategories: string[] }[] = [
    {
      name: "Women",
      subCategories: [
        "Suits",
        "Kurtis",
        "Sarees",
        "Ethnic Wear",
        "Lehenga Cholis",
        "Dresses",
        "Dupattas & Shawls",
        "Chikan Suits",
      ],
    },
    {
      name: "Men",
      subCategories: ["Kurta Pajama", "Shirts", "Pants", "Coats", "Waistcoats", "Pathani Suits"],
    },
  ];

  const categories: Record<string, { id: number; subs: Record<string, number> }> = {};

  for (const def of categoryDefs) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(def.name) },
      update: {},
      create: { name: def.name, slug: slugify(def.name), status: true },
    });

    const subs: Record<string, number> = {};
    for (const subName of def.subCategories) {
      const sub = await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: slugify(subName) } },
        update: {},
        create: { categoryId: category.id, name: subName, slug: slugify(subName) },
      });
      subs[subName] = sub.id;
    }
    categories[def.name] = { id: category.id, subs };
  }

  // --- Sample products ---
  // No product images are seeded: the legacy site's own image files turned out to be either
  // unrelated stock photos (a camera, branded kids' shoes) or marketing banners with prices
  // baked into the graphic, none of which are safe or accurate to reuse. Product pages fall
  // back to a placeholder until real photos are uploaded via the admin panel.
  const productDefs = [
    {
      name: "Anarkali Suit",
      code: "SAMPLE-AN01",
      category: "Women",
      subCategory: "Suits",
      mrp: 2599,
      price: 1999,
      description: "Party wear Anarkali suit with embroidered neckline.",
    },
    {
      name: "Chikankari Kurti",
      code: "SAMPLE-CK01",
      category: "Women",
      subCategory: "Kurtis",
      mrp: 1899,
      price: 1499,
      description: "Hand-embroidered chikankari kurti.",
    },
    {
      name: "Three Piece Suit",
      code: "SAMPLE-SR01",
      category: "Women",
      subCategory: "Sarees",
      mrp: 3499,
      price: 2799,
      description: "Sharp three-piece suit with a tailored fit.",
      imageUrl: "/images/Three-Piece-Suit.png",
    },
    {
      name: "Kurta Pajama Set",
      code: "SAMPLE-KP01",
      category: "Men",
      subCategory: "Kurta Pajama",
      mrp: 1699,
      price: 1299,
      description: "Classic cotton kurta pajama set.",
      imageUrl: "/images/Kurta-Pajama.png",
    },
    {
      name: "Pathani Suit",
      code: "SAMPLE-PS01",
      category: "Men",
      subCategory: "Pathani Suits",
      mrp: 1999,
      price: 1599,
      description: "Comfortable everyday Pathani suit.",
    },
    {
      name: "Nehru Waistcoat",
      code: "SAMPLE-WC01",
      category: "Men",
      subCategory: "Waistcoats",
      mrp: 1499,
      price: 1199,
      description: "Festive Nehru-style waistcoat.",
    },
  ];

  for (const p of productDefs) {
    const categoryId = categories[p.category].id;
    const subCategoryId = categories[p.category].subs[p.subCategory];

    const imageUrl = "imageUrl" in p ? p.imageUrl : undefined;

    await prisma.product.upsert({
      where: { code: p.code },
      update: { name: p.name, description: p.description },
      create: {
        categoryId,
        subCategoryId,
        name: p.name,
        code: p.code,
        description: p.description,
        mrp: p.mrp,
        price: p.price,
        status: true,
        variants: {
          create: [
            { size: "38", color: "Default", mrp: p.mrp, price: p.price, qty: 10 },
            { size: "40", color: "Default", mrp: p.mrp, price: p.price, qty: 10 },
          ],
        },
        ...(imageUrl && { images: { create: [{ url: imageUrl, sortOrder: 0 }] } }),
      },
    });
  }

  // --- Stitch (custom tailoring) categories (no images — see note above) ---
  const stitchCategoryDefs = [
    "Kurta Pajama",
    "Salwar Suit",
    "Coat & Pant",
    "Blazer",
    "Pathani Suit",
    "Three Piece Suit",
  ];

  for (const name of stitchCategoryDefs) {
    const existing = await prisma.stitchCategory.findFirst({ where: { name } });
    if (!existing) {
      await prisma.stitchCategory.create({ data: { name } });
    }
  }

  // --- Admin user ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@fakirefashion.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    },
  });

  // --- Tailor test user (pre-approved so it can log in immediately) ---
  const tailorEmail = process.env.SEED_TAILOR_EMAIL ?? "tailor@fakirefashion.local";
  const tailorPassword = process.env.SEED_TAILOR_PASSWORD ?? "Tailor123!";

  await prisma.user.upsert({
    where: { email: tailorEmail },
    update: {},
    create: {
      name: "Test Tailor",
      email: tailorEmail,
      passwordHash: await bcrypt.hash(tailorPassword, 10),
      role: "tailor",
      approved: true,
    },
  });

  // --- Customer test user ---
  const customerEmail = process.env.SEED_CUSTOMER_EMAIL ?? "customer@fakirefashion.local";
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD ?? "Customer123!";

  await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      name: "Test Customer",
      email: customerEmail,
      passwordHash: await bcrypt.hash(customerPassword, 10),
      role: "customer",
      mobile: "9999999999",
      address: "123 Sample Street, Test City, 000000",
    },
  });

  console.log("Seed complete.");
  console.log("");
  console.log("Login credentials:");
  console.log(`  Admin:    ${adminEmail} / ${adminPassword}  (login at /admin/login)`);
  console.log(`  Tailor:   ${tailorEmail} / ${tailorPassword}  (login at /tailor/login)`);
  console.log(`  Customer: ${customerEmail} / ${customerPassword}  (login at /login)`);
  console.log("");
  console.log("Override any of these via SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD,");
  console.log("SEED_TAILOR_EMAIL/SEED_TAILOR_PASSWORD, SEED_CUSTOMER_EMAIL/SEED_CUSTOMER_PASSWORD.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
