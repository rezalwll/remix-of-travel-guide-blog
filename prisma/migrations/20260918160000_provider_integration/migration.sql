ALTER TABLE "Order" ADD COLUMN "providerName" TEXT;
ALTER TABLE "Order" ADD COLUMN "externalReference" TEXT;
ALTER TABLE "Order" ADD COLUMN "providerPayload" JSONB;

CREATE TABLE "PaymentIntent" (
    "id" UUID NOT NULL,
    "checkoutSessionId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TOMAN',
    "status" TEXT NOT NULL DEFAULT 'created',
    "idempotencyKey" TEXT NOT NULL,
    "externalReference" TEXT NOT NULL,
    "redirectUrl" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PaymentCallback" (
    "id" UUID NOT NULL,
    "paymentIntentId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "externalReference" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "signature" TEXT,
    "payload" JSONB,
    "callbackKey" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentCallback_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PaymentVerification" (
    "id" UUID NOT NULL,
    "paymentIntentId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "externalReference" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorCode" TEXT,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentVerification_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SmsDeliveryAttempt" (
    "id" UUID NOT NULL,
    "mobile" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerReference" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SmsDeliveryAttempt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BookingAttempt" (
    "id" UUID NOT NULL,
    "orderId" UUID,
    "provider" TEXT NOT NULL,
    "providerReference" TEXT,
    "status" TEXT NOT NULL,
    "requestSnapshot" JSONB,
    "responseSnapshot" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookingAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentIntent_externalReference_key" ON "PaymentIntent"("externalReference");
CREATE UNIQUE INDEX "PaymentIntent_checkoutSessionId_idempotencyKey_key" ON "PaymentIntent"("checkoutSessionId", "idempotencyKey");
CREATE UNIQUE INDEX "PaymentCallback_callbackKey_key" ON "PaymentCallback"("callbackKey");
CREATE INDEX "PaymentIntent_externalReference_status_idx" ON "PaymentIntent"("externalReference", "status");
CREATE INDEX "PaymentCallback_externalReference_createdAt_idx" ON "PaymentCallback"("externalReference", "createdAt");
CREATE INDEX "PaymentVerification_externalReference_createdAt_idx" ON "PaymentVerification"("externalReference", "createdAt");
CREATE INDEX "SmsDeliveryAttempt_mobile_createdAt_idx" ON "SmsDeliveryAttempt"("mobile", "createdAt");
CREATE INDEX "SmsDeliveryAttempt_providerReference_idx" ON "SmsDeliveryAttempt"("providerReference");
CREATE INDEX "BookingAttempt_orderId_createdAt_idx" ON "BookingAttempt"("orderId", "createdAt");
CREATE INDEX "BookingAttempt_provider_status_idx" ON "BookingAttempt"("provider", "status");
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentCallback" ADD CONSTRAINT "PaymentCallback_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentVerification" ADD CONSTRAINT "PaymentVerification_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingAttempt" ADD CONSTRAINT "BookingAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
