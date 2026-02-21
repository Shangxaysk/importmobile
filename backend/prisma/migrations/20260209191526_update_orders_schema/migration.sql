/*
  Warnings:

  - The values [PENDING,PAID] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `adminNote` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `comment` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - Made the column `paymentReceipt` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('NEW', 'ACCEPTED', 'WAITING_PHOTO', 'REJECTED', 'ORDERED', 'ARRIVED', 'DELIVERED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "adminNote",
ADD COLUMN     "extraPhone" TEXT,
ALTER COLUMN "status" SET DEFAULT 'NEW',
ALTER COLUMN "paymentReceipt" SET NOT NULL,
ALTER COLUMN "comment" SET DATA TYPE VARCHAR(300);

-- CreateTable
CREATE TABLE "BotSettings" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "targetChatId" TEXT,
    "targetChatName" TEXT,

    CONSTRAINT "BotSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotSettings_adminId_key" ON "BotSettings"("adminId");
