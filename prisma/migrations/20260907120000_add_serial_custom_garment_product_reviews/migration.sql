-- DropForeignKey
ALTER TABLE "stitch_orders" DROP CONSTRAINT "stitch_orders_stitchCategoryId_fkey";

-- AlterTable
ALTER TABLE "stitch_orders" ADD COLUMN     "customGarmentName" TEXT,
ADD COLUMN     "serialNumber" SERIAL NOT NULL,
ALTER COLUMN "stitchCategoryId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_productId_userId_key" ON "product_reviews"("productId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "stitch_orders_serialNumber_key" ON "stitch_orders"("serialNumber");

-- AddForeignKey
ALTER TABLE "stitch_orders" ADD CONSTRAINT "stitch_orders_stitchCategoryId_fkey" FOREIGN KEY ("stitchCategoryId") REFERENCES "stitch_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
