-- CreateTable
CREATE TABLE "ContactSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "phone" TEXT NOT NULL DEFAULT '+998 90 123 45 67',
    "telegram" TEXT NOT NULL DEFAULT '@admin_user',
    "email" TEXT NOT NULL DEFAULT 'info@example.com',
    "address" TEXT NOT NULL DEFAULT 'Toshkent sh.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSettings_pkey" PRIMARY KEY ("id")
);
