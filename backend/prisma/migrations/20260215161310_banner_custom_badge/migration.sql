/*
  Warnings:

  - You are about to drop the column `badgeStyle` on the `Banner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "badgeStyle",
ADD COLUMN     "badgeColor" TEXT DEFAULT '#ef4444',
ADD COLUMN     "badgePosition" TEXT DEFAULT 'top-right',
ADD COLUMN     "badgeTextColor" TEXT DEFAULT '#ffffff';
