-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adminMessage" TEXT,
ADD COLUMN     "deliveryDays" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "isMessageRead" BOOLEAN NOT NULL DEFAULT true;
