-- AlterTable
ALTER TABLE "GlobalSettings" ADD COLUMN     "isOrdersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "telegramLink" TEXT NOT NULL DEFAULT 'https://t.me/ImportMobile';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
