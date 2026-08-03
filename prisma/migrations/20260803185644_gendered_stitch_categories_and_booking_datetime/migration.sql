/*
  Warnings:

  - Added the required column `preferredDate` to the `stitch_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredTimeSlot` to the `stitch_orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "stitch_categories" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'male';

-- AlterTable
-- Existing rows predate this field; backfill with createdAt/a placeholder slot so the NOT NULL
-- constraint can be applied, since that historical data was never actually captured.
ALTER TABLE "stitch_orders" ADD COLUMN     "preferredDate" TIMESTAMP(3),
ADD COLUMN     "preferredTimeSlot" TEXT;

UPDATE "stitch_orders" SET "preferredDate" = "createdAt", "preferredTimeSlot" = 'Not specified' WHERE "preferredDate" IS NULL;

ALTER TABLE "stitch_orders" ALTER COLUMN "preferredDate" SET NOT NULL,
ALTER COLUMN "preferredTimeSlot" SET NOT NULL;
