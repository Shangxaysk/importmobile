/*
  Warnings:

  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Settings";

-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "cardNumber" TEXT NOT NULL DEFAULT '',
    "cardHolder" TEXT NOT NULL DEFAULT '',
    "dollarRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);
