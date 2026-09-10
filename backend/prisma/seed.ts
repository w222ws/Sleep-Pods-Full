import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(" Начинаем запуск сидинга базы данных...");

  // Очищаем старые данные, чтобы не было конфликтов по уникальным кодам
  await prisma.booking.deleteMany();
  await prisma.pod.deleteMany();

  // Заполняем капсулами
  const createdPods = await prisma.pod.createMany({
    data: [
      { code: "POD-101", type: "STANDARD", pricePerHour: 150, isActive: true },
      { code: "POD-102", type: "STANDARD", pricePerHour: 150, isActive: true },
      { code: "POD-103", type: "STANDARD", pricePerHour: 150, isActive: true },
      { code: "POD-201", type: "BUSINESS", pricePerHour: 250, isActive: true },
      { code: "POD-202", type: "BUSINESS", pricePerHour: 250, isActive: true },
      { code: "POD-301", type: "VIP", pricePerHour: 450, isActive: true },
    ],
  });

  console.log(` Сидинг успешно завершен! Создано капсул: ${createdPods.count}`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка во время сидинга:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
