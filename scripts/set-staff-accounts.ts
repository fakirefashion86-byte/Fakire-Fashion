import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@fakirefashion.local";
  const adminPassword = process.env.ADMIN_PASSWORD;
  const tailorEmail = process.env.TAILOR_EMAIL ?? "tailor@fakirefashion.local";
  const tailorPassword = process.env.TAILOR_PASSWORD;

  if (!adminPassword || !tailorPassword) {
    throw new Error("Set ADMIN_PASSWORD and TAILOR_PASSWORD environment variables before running.");
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await bcrypt.hash(adminPassword, 10), role: "admin" },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: tailorEmail },
    update: { passwordHash: await bcrypt.hash(tailorPassword, 10), role: "tailor" },
    create: {
      name: "Tailor",
      email: tailorEmail,
      passwordHash: await bcrypt.hash(tailorPassword, 10),
      role: "tailor",
    },
  });

  console.log("Admin and tailor accounts are set.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
