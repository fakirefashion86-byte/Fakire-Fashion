-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'out_for_delivery';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'delivery';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryOtp" TEXT,
ADD COLUMN     "deliveryOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "deliveryOtpGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryOtpVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryPersonId" INTEGER;

-- AlterTable
ALTER TABLE "stitch_orders" ADD COLUMN     "deliveryOtp" TEXT,
ADD COLUMN     "deliveryOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "deliveryOtpGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryOtpVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryPersonId" INTEGER;

-- CreateIndex
CREATE INDEX "orders_deliveryPersonId_idx" ON "orders"("deliveryPersonId");

-- CreateIndex
CREATE INDEX "stitch_orders_deliveryPersonId_idx" ON "stitch_orders"("deliveryPersonId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryPersonId_fkey" FOREIGN KEY ("deliveryPersonId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stitch_orders" ADD CONSTRAINT "stitch_orders_deliveryPersonId_fkey" FOREIGN KEY ("deliveryPersonId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

