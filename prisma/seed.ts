import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const at = (value: string) => new Date(value);

type DemoOrderFixture = {
  key: string;
  type: string;
  title: string;
  item?: Record<string, string>;
  hotel?: Record<string, string>;
  offer?: Record<string, string>;
  outbound?: Record<string, string>;
  total: number;
  paymentStatus: string;
  bookingStatus: string;
  relevantDate: string;
  createdAt: string;
};

const orderFixtures: DemoOrderFixture[] = [
  { key: "01", type: "flight", title: "تهران ← استانبول", item: { name: "پرواز تهران به استانبول" }, total: 18_760_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-10-12T05:30:00.000Z", createdAt: "2026-09-10T08:00:00.000Z" },
  { key: "02", type: "hotel", title: "هتل پارسیان آزادی تهران", hotel: { name: "هتل پارسیان آزادی تهران" }, total: 14_900_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-10-21T11:00:00.000Z", createdAt: "2026-09-08T09:15:00.000Z" },
  { key: "03", type: "train", title: "قطار زندگی تهران به مشهد", item: { trainName: "قطار زندگی تهران به مشهد" }, total: 4_240_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-08-18T17:20:00.000Z", createdAt: "2026-08-01T14:30:00.000Z" },
  { key: "04", type: "bus", title: "رویال سفر تهران به اصفهان", item: { company: "رویال سفر تهران به اصفهان" }, total: 1_360_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-10-03T14:00:00.000Z", createdAt: "2026-09-12T10:40:00.000Z" },
  { key: "05", type: "tour", title: "تور پنج‌روزه کیش", offer: { title: "تور پنج‌روزه کیش" }, total: 32_800_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-11-08T04:30:00.000Z", createdAt: "2026-09-03T07:20:00.000Z" },
  { key: "06", type: "ziyarat", title: "کاروان هوایی نجف و کربلا", offer: { title: "کاروان هوایی نجف و کربلا" }, total: 47_500_000, paymentStatus: "paid", bookingStatus: "paid_booking_pending", relevantDate: "2026-11-22T03:45:00.000Z", createdAt: "2026-09-15T16:25:00.000Z" },
  { key: "07", type: "insurance", title: "بیمه مسافرتی شنگن ۱۵ روزه", item: { name: "بیمه مسافرتی شنگن ۱۵ روزه" }, total: 1_890_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-10-12T00:00:00.000Z", createdAt: "2026-09-10T08:20:00.000Z" },
  { key: "08", type: "cip", title: "CIP فرودگاه امام خمینی", item: { name: "CIP فرودگاه امام خمینی" }, total: 3_650_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-10-12T02:30:00.000Z", createdAt: "2026-09-11T11:10:00.000Z" },
  { key: "09", type: "transfer", title: "ترانسفر فرودگاه استانبول تا تکسیم", item: { name: "ترانسفر فرودگاه استانبول تا تکسیم" }, total: 2_980_000, paymentStatus: "paid", bookingStatus: "confirmed", relevantDate: "2026-10-12T09:40:00.000Z", createdAt: "2026-09-11T11:20:00.000Z" },
  { key: "10", type: "flight", title: "تهران ← شیراز", outbound: { fromCity: "تهران", toCity: "شیراز" }, total: 5_340_000, paymentStatus: "refunded", bookingStatus: "refunded", relevantDate: "2026-07-18T06:00:00.000Z", createdAt: "2026-07-02T06:30:00.000Z" },
  { key: "11", type: "hotel", title: "هتل شایگان کیش", hotel: { name: "هتل شایگان کیش" }, total: 11_600_000, paymentStatus: "paid", bookingStatus: "manual_review_required", relevantDate: "2026-10-28T11:00:00.000Z", createdAt: "2026-09-16T13:35:00.000Z" },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { mobile: "09121234567" },
    update: {
      firstName: "آرمان",
      lastName: "نمونه",
      email: "demo@kiashi.example",
      birthDate: at("1991-05-12T00:00:00.000Z"),
      nationalId: "DEMO-IR-001",
    },
    create: {
      mobile: "09121234567",
      firstName: "آرمان",
      lastName: "نمونه",
      email: "demo@kiashi.example",
      birthDate: at("1991-05-12T00:00:00.000Z"),
      nationalId: "DEMO-IR-001",
    },
  });

  const wallet = await prisma.wallet.upsert({
    where: { userId: user.id },
    update: { balance: 4_250_000, currency: "TOMAN" },
    create: { userId: user.id, balance: 4_250_000, currency: "TOMAN" },
  });
  await prisma.orderCounter.upsert({ where: { id: 1 }, update: {}, create: { id: 1, nextValue: 11 } });

  const passengers = [
    { id: "10000000-0000-4000-8000-000000000001", firstName: "آرمان", lastName: "نمونه", nationalId: "DEMO-NID-01", passportNumber: "DEMO-P-0001", birthDate: at("1991-05-12T00:00:00.000Z") },
    { id: "10000000-0000-4000-8000-000000000002", firstName: "رها", lastName: "نمونه", nationalId: "DEMO-NID-02", passportNumber: "DEMO-P-0002", birthDate: at("1994-11-03T00:00:00.000Z") },
    { id: "10000000-0000-4000-8000-000000000003", firstName: "سام", lastName: "نمونه", nationalId: "DEMO-NID-03", passportNumber: null, birthDate: at("2018-03-18T00:00:00.000Z") },
  ];
  for (const passenger of passengers) {
    await prisma.passenger.upsert({ where: { id: passenger.id }, update: { ...passenger, userId: user.id }, create: { ...passenger, userId: user.id } });
  }

  for (const fixture of orderFixtures) {
    const checkoutId = `20000000-0000-4000-8000-0000000000${fixture.key}`;
    const orderId = `30000000-0000-4000-8000-0000000000${fixture.key}`;
    const service = {
      title: fixture.title,
      ...(fixture.item ? { item: fixture.item } : {}),
      ...(fixture.hotel ? { hotel: fixture.hotel } : {}),
      ...(fixture.offer ? { offer: fixture.offer } : {}),
      ...(fixture.outbound ? { outbound: fixture.outbound } : {}),
      inventoryMode: "demo",
    };
    const buyer = { firstName: user.firstName, lastName: user.lastName, mobile: user.mobile, email: user.email };
    const travelers = [{ firstName: "آرمان", lastName: "نمونه", identifier: "DEMO-NID-01" }];
    await prisma.checkoutSession.upsert({
      where: { id: checkoutId },
      update: { userId: user.id, guestMobile: user.mobile, serviceType: fixture.type, status: "completed", service, buyer, travelers, addOns: [], pricing: { base: fixture.total, discount: 0, payable: fixture.total }, total: fixture.total, expiresAt: at("2027-01-01T00:00:00.000Z") },
      create: { id: checkoutId, userId: user.id, guestMobile: user.mobile, serviceType: fixture.type, status: "completed", service, buyer, travelers, addOns: [], pricing: { base: fixture.total, discount: 0, payable: fixture.total }, total: fixture.total, expiresAt: at("2027-01-01T00:00:00.000Z"), createdAt: at(fixture.createdAt) },
    });
    await prisma.order.upsert({
      where: { id: orderId },
      update: { userId: user.id, summary: { title: fixture.title, demo: true }, buyer, travelers, serviceSnapshot: service, pricingSnapshot: { total: fixture.total, currency: "TOMAN" }, paymentSnapshot: { method: "online_mock", reference: `DEMO-PAY-${fixture.key}` }, total: fixture.total, paymentStatus: fixture.paymentStatus, bookingStatus: fixture.bookingStatus, relevantDate: at(fixture.relevantDate), providerName: "internal-mock", externalReference: `DEMO-SUP-${fixture.key}` },
      create: { id: orderId, userId: user.id, checkoutSessionId: checkoutId, orderNumber: `KIA-DEMO-${fixture.key}`, trackingCode: `TRK-DEMO-${fixture.key}`, guestMobile: user.mobile, serviceType: fixture.type, summary: { title: fixture.title, demo: true }, buyer, travelers, serviceSnapshot: service, pricingSnapshot: { total: fixture.total, currency: "TOMAN" }, paymentSnapshot: { method: "online_mock", reference: `DEMO-PAY-${fixture.key}` }, total: fixture.total, paymentStatus: fixture.paymentStatus, bookingStatus: fixture.bookingStatus, providerName: "internal-mock", externalReference: `DEMO-SUP-${fixture.key}`, relevantDate: at(fixture.relevantDate), createdAt: at(fixture.createdAt) },
    });
    await prisma.paymentAttempt.upsert({
      where: { id: `40000000-0000-4000-8000-0000000000${fixture.key}` },
      update: { status: fixture.paymentStatus === "refunded" ? "refunded" : "succeeded", amount: fixture.total, orderId },
      create: { id: `40000000-0000-4000-8000-0000000000${fixture.key}`, checkoutSessionId: checkoutId, orderId, provider: "mock", method: "online_mock", status: fixture.paymentStatus === "refunded" ? "refunded" : "succeeded", amount: fixture.total, onlineAmount: fixture.total, walletAmount: 0, idempotencyKey: `demo-payment-${fixture.key}`, reference: `DEMO-PAY-${fixture.key}`, completedAt: at(fixture.createdAt), createdAt: at(fixture.createdAt) },
    });
  }

  const walletEntries = [
    { id: "50000000-0000-4000-8000-000000000001", type: "initial_credit", amount: 6_000_000, balanceAfter: 6_000_000, reference: "DEMO-WALLET-INITIAL", createdAt: at("2026-06-01T08:00:00.000Z") },
    { id: "50000000-0000-4000-8000-000000000002", type: "debit", amount: -3_000_000, balanceAfter: 3_000_000, reference: "DEMO-WALLET-FLIGHT", createdAt: at("2026-07-02T06:30:00.000Z") },
    { id: "50000000-0000-4000-8000-000000000003", type: "refund_credit", amount: 750_000, balanceAfter: 3_750_000, reference: "DEMO-WALLET-REFUND", createdAt: at("2026-07-08T10:15:00.000Z") },
    { id: "50000000-0000-4000-8000-000000000004", type: "bonus_credit", amount: 500_000, balanceAfter: 4_250_000, reference: "DEMO-WALLET-BONUS", createdAt: at("2026-09-01T09:00:00.000Z") },
  ];
  for (const entry of walletEntries) {
    await prisma.walletTransaction.upsert({ where: { reference: entry.reference }, update: { ...entry, walletId: wallet.id }, create: { ...entry, walletId: wallet.id } });
  }

  const favorites = [{ itemType: "hotel", itemId: "h-tehran-azadi" }, { itemType: "tour", itemId: "tour-kish-5d" }, { itemType: "ziyarat", itemId: "ziyarat-najaf-karbala" }];
  for (const favorite of favorites) {
    await prisma.favorite.upsert({ where: { userId_itemType_itemId: { userId: user.id, ...favorite } }, update: {}, create: { userId: user.id, ...favorite } });
  }

  const notifications = [
    { key: "flight-confirmed", type: "order", title: "سفارش پرواز شما تأیید شد", body: "پرواز تهران به استانبول تأیید شده و جزئیات آن در سفارش‌ها در دسترس است.", createdAt: "2026-09-10T08:10:00.000Z", read: true },
    { key: "trip-near", type: "reminder", title: "زمان حرکت سفر شما نزدیک است", body: "برای سفر پیش رو مدارک و ساعت حضور در فرودگاه را دوباره بررسی کنید.", createdAt: "2026-09-16T07:15:00.000Z", read: false },
    { key: "refund-done", type: "refund", title: "استرداد با موفقیت انجام شد", body: "سهم کیف پول سفارش تهران به شیراز به حساب شما بازگشت.", createdAt: "2026-07-08T10:15:00.000Z", read: true },
    { key: "kish-offer", type: "offer", title: "پیشنهاد ویژه سفر به کیش", body: "چند گزینهٔ نمایشی تازه برای پرواز و هتل کیش آماده مقایسه است.", createdAt: "2026-09-14T12:00:00.000Z", read: false },
    { key: "support-replied", type: "support", title: "درخواست پشتیبانی پاسخ داده شد", body: "پاسخ تیم پشتیبانی دربارهٔ واچر هتل در حساب شما ثبت شده است.", createdAt: "2026-09-13T09:45:00.000Z", read: false },
  ];
  for (const note of notifications) {
    await prisma.notification.upsert({ where: { dedupeKey: `demo-${note.key}` }, update: { title: note.title, body: note.body, type: note.type, readAt: note.read ? at(note.createdAt) : null }, create: { userId: user.id, dedupeKey: `demo-${note.key}`, title: note.title, body: note.body, type: note.type, readAt: note.read ? at(note.createdAt) : null, createdAt: at(note.createdAt) } });
  }

  const tickets = [
    { id: "60000000-0000-4000-8000-000000000001", subject: "تغییر اطلاعات مسافر", status: "closed", messages: [{ id: "61000000-0000-4000-8000-000000000001", authorType: "customer", body: "نام خانوادگی مسافر دوم نیاز به اصلاح دارد." }, { id: "61000000-0000-4000-8000-000000000002", authorType: "support", body: "اصلاح انجام شد و نسخهٔ جدید اطلاعات در سفارش ثبت شده است." }] },
    { id: "60000000-0000-4000-8000-000000000002", subject: "پیگیری استرداد", status: "resolved", messages: [{ id: "61000000-0000-4000-8000-000000000003", authorType: "customer", body: "زمان بازگشت مبلغ سفارش لغوشده را می‌خواستم بدانم." }, { id: "61000000-0000-4000-8000-000000000004", authorType: "support", body: "استرداد تکمیل شده و سهم کیف پول در گردش حساب قابل مشاهده است." }] },
    { id: "60000000-0000-4000-8000-000000000003", subject: "وضعیت واچر هتل", status: "open", messages: [{ id: "61000000-0000-4000-8000-000000000005", authorType: "customer", body: "واچر رزرو تهران چه زمانی صادر می‌شود؟" }, { id: "61000000-0000-4000-8000-000000000006", authorType: "support", body: "رزرو تأیید شده و واچر تا چند دقیقه دیگر در جزئیات سفارش قرار می‌گیرد." }] },
  ];
  for (const ticket of tickets) {
    await prisma.supportTicket.upsert({ where: { id: ticket.id }, update: { userId: user.id, subject: ticket.subject, status: ticket.status }, create: { id: ticket.id, userId: user.id, subject: ticket.subject, status: ticket.status, createdAt: at("2026-09-12T08:00:00.000Z") } });
    for (const message of ticket.messages) {
      await prisma.supportMessage.upsert({ where: { id: message.id }, update: { authorType: message.authorType, body: message.body }, create: { ...message, ticketId: ticket.id, createdAt: at("2026-09-12T08:15:00.000Z") } });
    }
  }

  await prisma.visaApplication.upsert({
    where: { id: "70000000-0000-4000-8000-000000000001" },
    update: { userId: user.id, country: "امارات", status: "under_review", payload: { purpose: "گردشگری", travelMonth: "آبان ۱۴۰۵", travelers: 2, documentState: "complete", demo: true } },
    create: { id: "70000000-0000-4000-8000-000000000001", userId: user.id, country: "امارات", status: "under_review", payload: { purpose: "گردشگری", travelMonth: "آبان ۱۴۰۵", travelers: 2, documentState: "complete", demo: true }, createdAt: at("2026-09-05T10:00:00.000Z") },
  });
  await prisma.visaApplication.upsert({
    where: { id: "70000000-0000-4000-8000-000000000002" },
    update: { userId: user.id, country: "ترکیه", status: "draft", payload: { purpose: "گردشگری", travelers: 1, documentState: "incomplete", demo: true } },
    create: { id: "70000000-0000-4000-8000-000000000002", userId: user.id, country: "ترکیه", status: "draft", payload: { purpose: "گردشگری", travelers: 1, documentState: "incomplete", demo: true }, createdAt: at("2026-09-17T10:00:00.000Z") },
  });

  await prisma.refundRequest.upsert({
    where: { id: "80000000-0000-4000-8000-000000000001" },
    update: { status: "completed", completedAt: at("2026-07-08T10:15:00.000Z") },
    create: { id: "80000000-0000-4000-8000-000000000001", orderId: "30000000-0000-4000-8000-000000000010", userId: user.id, amount: 5_340_000, reason: "لغو پرواز توسط تأمین‌کنندهٔ نمایشی", destination: "original_payment", status: "completed", walletAmount: 750_000, onlineAmount: 4_590_000, providerReference: "DEMO-REFUND-10", completedAt: at("2026-07-08T10:15:00.000Z"), createdAt: at("2026-07-03T07:00:00.000Z") },
  });
  await prisma.bookingAttempt.upsert({
    where: { requestKey: "demo-booking-manual-review" },
    update: { status: "UNKNOWN" },
    create: { id: "90000000-0000-4000-8000-000000000001", orderId: "30000000-0000-4000-8000-000000000011", provider: "mock-hotel", requestKey: "demo-booking-manual-review", providerReference: "DEMO-MANUAL-11", status: "UNKNOWN", requestSnapshot: { inventoryMode: "demo" }, responseSnapshot: { message: "پاسخ تأمین‌کننده قطعی نیست" }, createdAt: at("2026-09-16T13:36:00.000Z") },
  });

  console.log(`Seeded ${user.mobile}: ${orderFixtures.length} orders, ${walletEntries.length} wallet entries, ${tickets.length} support threads, balance ${wallet.balance} TOMAN`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
