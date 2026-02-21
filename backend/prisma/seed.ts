import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bazaga ma\'lumot ekish boshlandi...');

  // 1. Kataloglarni yaratamiz
  const smartphoneCategory = await prisma.category.create({
    data: {
      nameUz: 'Smartfonlar',
      nameRu: 'Смартфоны',
      hasSpecs: true, // Bu katalogda texnik xususiyatlar bor
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

  // 2. Mahsulot yaratamiz (iPhone 15 Pro)
  await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro Max',
      description: 'Titan korpus, A17 Pro chip, eng kuchli kamera.',
      price: 16250000, // So'mda
      originalPrice: 16500000,
      images: [
        'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select-202309',
        'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-blue-titanium-select-202309'
      ],
      categoryId: smartphoneCategory.id,
      isAvailable: true,
      // JSON formatdagi xususiyatlar
      specifications: {
        screen: "6.7 inch OLED",
        cpu: "A17 Pro",
        ram: "8GB",
        storage: "256GB",
        battery: "4422 mAh",
        sim: "eSIM + Nano SIM"
      }
    },
  });

  console.log('✅ Baza muvaffaqiyatli to\'ldirildi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });