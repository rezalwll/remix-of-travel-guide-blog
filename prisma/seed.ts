import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({ where: { mobile: "09121234567" }, update: { firstName: "کاربر", lastName: "نمونه" }, create: { mobile: "09121234567", firstName: "کاربر", lastName: "نمونه" } });
  await prisma.wallet.upsert({ where: { userId: user.id }, update: { balance: 4_250_000, currency: "TOMAN" }, create: { userId: user.id, balance: 4_250_000, currency: "TOMAN" } });
  await prisma.orderCounter.upsert({ where: { id: 1 }, update: {}, create: { id: 1, nextValue: 0 } });
  await prisma.notification.create({ data: { userId: user.id, type: "system", title: "خوش آمدید", body: "این حساب برای محیط نمایشی کی‌آشی ساخته شده است." } });
  console.log(`Seeded demo user ${user.mobile} with 4,250,000 TOMAN`);
}
main().finally(() => prisma.$disconnect());
