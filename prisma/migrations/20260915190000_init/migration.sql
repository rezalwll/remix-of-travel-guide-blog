-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "mobile" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "mobile" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "nationalId" TEXT,
    "passportNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "guestMobile" TEXT,
    "serviceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready_for_payment',
    "service" JSONB NOT NULL,
    "buyer" JSONB NOT NULL,
    "travelers" JSONB NOT NULL,
    "addOns" JSONB NOT NULL,
    "coupon" TEXT,
    "pricing" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TOMAN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderCounter" (
    "id" INTEGER NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "checkoutSessionId" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "guestMobile" TEXT,
    "serviceType" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "buyer" JSONB NOT NULL,
    "travelers" JSONB NOT NULL,
    "serviceSnapshot" JSONB NOT NULL,
    "pricingSnapshot" JSONB NOT NULL,
    "paymentSnapshot" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TOMAN',
    "paymentStatus" TEXT NOT NULL DEFAULT 'paid',
    "bookingStatus" TEXT NOT NULL DEFAULT 'confirmed',
    "relevantDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" UUID NOT NULL,
    "checkoutSessionId" UUID NOT NULL,
    "orderId" UUID,
    "provider" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "walletAmount" INTEGER NOT NULL DEFAULT 0,
    "onlineAmount" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT NOT NULL,
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "orderId" UUID,
    "walletId" UUID,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TOMAN',
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TOMAN',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "userId" UUID,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "authorType" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaApplication" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "OtpChallenge_mobile_expiresAt_idx" ON "OtpChallenge"("mobile", "expiresAt");

-- CreateIndex
CREATE INDEX "OtpChallenge_mobile_createdAt_idx" ON "OtpChallenge"("mobile", "createdAt");

-- CreateIndex
CREATE INDEX "Passenger_userId_idx" ON "Passenger"("userId");

-- CreateIndex
CREATE INDEX "CheckoutSession_userId_createdAt_idx" ON "CheckoutSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutSession_guestMobile_createdAt_idx" ON "CheckoutSession"("guestMobile", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutSession_status_expiresAt_idx" ON "CheckoutSession"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkoutSessionId_key" ON "Order"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_trackingCode_key" ON "Order"("trackingCode");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_guestMobile_createdAt_idx" ON "Order"("guestMobile", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_reference_key" ON "PaymentAttempt"("reference");

-- CreateIndex
CREATE INDEX "PaymentAttempt_orderId_createdAt_idx" ON "PaymentAttempt"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_checkoutSessionId_idempotencyKey_key" ON "PaymentAttempt"("checkoutSessionId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_reference_key" ON "WalletTransaction"("reference");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "RefundRequest_orderId_status_idx" ON "RefundRequest"("orderId", "status");

-- CreateIndex
CREATE INDEX "RefundRequest_userId_createdAt_idx" ON "RefundRequest"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_itemType_itemId_key" ON "Favorite"("userId", "itemType", "itemId");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_createdAt_idx" ON "SupportTicket"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportMessage_ticketId_createdAt_idx" ON "SupportMessage"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "VisaApplication_userId_createdAt_idx" ON "VisaApplication"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpChallenge" ADD CONSTRAINT "OtpChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


