import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({ where: { mobile: "09121234567" }, update: { firstName: "کاربر", lastName: "نمونه" }, create: { mobile: "09121234567", firstName: "کاربر", lastName: "نمونه" } });
  await prisma.wallet.upsert({ where: { userId: user.id }, update: { balance: 4_250_000 }, create: { userId: user.id, balance: 4_250_000, currency: "IRR" } });
  console.log(`Seeded demo user ${user.mobile} with 4,250,000 IRR`);
}
main().finally(() => prisma.$disconnect());
