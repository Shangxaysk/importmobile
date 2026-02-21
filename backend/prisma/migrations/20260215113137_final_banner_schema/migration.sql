/*
  Warnings:

  - You are about to drop the column `productId` on the `Banner` table. All the data in the column will be lost.
  - Added the required column `linkValue` to the `Banner` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BannerLinkType" AS ENUM ('PRODUCT', 'CATEGORY', 'EXTERNAL');

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "productId",
ADD COLUMN     "badgeStyle" TEXT,
ADD COLUMN     "badgeText" TEXT,
ADD COLUMN     "linkType" "BannerLinkType" NOT NULL DEFAULT 'PRODUCT',
ADD COLUMN     "linkValue" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentId" INTEGER,
ALTER COLUMN "nameRu" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "originalPrice" SET DATA TYPE DECIMAL(15,2);

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
