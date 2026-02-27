import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bazaga ma\'lumot ekish boshlandi...');

  // 1. GLOBAL SOZLAMALARNI YARATISH (Yoki yangilash)
  // upsert - bu agar ma'lumot bo'lsa yangilaydi, yo'q bo'lsa yaratadi
  await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isOrdersEnabled: true,
      telegramLink: 'https://t.me/importmobile_uz',
    },
  });
  console.log('⚙️ Global sozlamalar tayyorlandi.');

  // 2. Kataloglarni yaratamiz
  const smartphoneCategory = await prisma.category.create({
    data: {
      nameUz: 'Smartfonlar',
      nameRu: 'Смартфоны',
      hasSpecs: true,
      image: 'https://cdn-icons-png.flaticon.com/512/644/644458.png',
    },
  });

  const laptopCategory = await prisma.category.create({
    data: {
      nameUz: 'Noutbuklar',
      nameRu: 'Ноутбуки',
      hasSpecs: true,
      image: 'https://cdn-icons-png.flaticon.com/512/428/428001.png',
    },
  });

  // 3. Mahsulot yaratamiz
  await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro Max',
      description: 'Titan korpus, A17 Pro chip, eng kuchli kamera.',
      price: 1200, // Dollarda (frontedda $ ko'rsatayotganingiz uchun)
      deliveryTime: '15-20',
      prepaymentPercent: 100,
      isActive: true, // Yangi qo'shilgan maydon
      images: [
        'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select-202309',
      ],
      specifications: {
        screen: "6.7 inch OLED",
        chipset: "A17 Pro",
        battery: "4422 mAh",
        sim: "eSIM + Nano SIM"
      },
      category: {
        connect: { id: smartphoneCategory.id }
      }
    },
  });

  console.log('✅ Baza muvaffaqiyatli to\'ldirildi!');
}

main()
  .catch((e) => {
    console.error('❌ Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });