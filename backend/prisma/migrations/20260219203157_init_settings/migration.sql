-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "phone" TEXT NOT NULL DEFAULT '+998 90 123 45 67',
    "telegram" TEXT NOT NULL DEFAULT '@importmobile_admin',
    "email" TEXT NOT NULL DEFAULT 'info@importmobile.uz',
    "address" TEXT NOT NULL DEFAULT 'Toshkent sh.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
