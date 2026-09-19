ALTER TABLE "RefundRequest"
  ADD COLUMN "compensationKey" TEXT,
  ADD COLUMN "walletAmount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "onlineAmount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "providerReference" TEXT,
  ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "Notification" ADD COLUMN "dedupeKey" TEXT;
ALTER TABLE "BookingAttempt" ADD COLUMN "requestKey" TEXT;
UPDATE "BookingAttempt" SET "requestKey" = CONCAT('legacy:', "id") WHERE "requestKey" IS NULL;
ALTER TABLE "BookingAttempt" ALTER COLUMN "requestKey" SET NOT NULL;
UPDATE "Order" SET "bookingStatus" = 'paid_booking_pending' WHERE "bookingStatus" = 'pending';
UPDATE "RefundRequest" SET "onlineAmount" = "amount" WHERE "amount" > 0 AND "walletAmount" = 0 AND "onlineAmount" = 0;

CREATE UNIQUE INDEX "RefundRequest_compensationKey_key" ON "RefundRequest"("compensationKey");
CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");
CREATE UNIQUE INDEX "BookingAttempt_requestKey_key" ON "BookingAttempt"("requestKey");
CREATE UNIQUE INDEX "RefundRequest_one_open_per_order_key" ON "RefundRequest"("orderId") WHERE "status" IN ('requested','processing');
CREATE INDEX "Order_bookingStatus_updatedAt_idx" ON "Order"("bookingStatus", "updatedAt");

ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_total_nonnegative" CHECK ("total" >= 0);
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_amounts_valid" CHECK ("amount" >= 0 AND "walletAmount" >= 0 AND "onlineAmount" >= 0 AND "walletAmount" + "onlineAmount" = "amount");
ALTER TABLE "Order" ADD CONSTRAINT "Order_total_nonnegative" CHECK ("total" >= 0);
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_balance_nonnegative" CHECK ("balance" >= 0);
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_amounts_valid" CHECK ("amount" >= 0 AND "walletAmount" >= 0 AND "onlineAmount" >= 0 AND "walletAmount" + "onlineAmount" = "amount");
CREATE OR REPLACE FUNCTION enforce_refund_not_over_order_total() RETURNS trigger AS $$
BEGIN
  IF NEW."amount" > (SELECT "total" FROM "Order" WHERE "id" = NEW."orderId") THEN
    RAISE EXCEPTION 'refund exceeds order total';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "RefundRequest_not_over_order_total"
BEFORE INSERT OR UPDATE OF "amount" ON "RefundRequest"
FOR EACH ROW EXECUTE FUNCTION enforce_refund_not_over_order_total();

ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_status_check" CHECK ("status" IN ('ready_for_payment','payment_pending','completed','expired'));
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_status_check" CHECK ("status" IN ('pending','succeeded','failed','cancelled','refunded'));
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_status_check" CHECK ("status" IN ('created','pending','succeeded','failed','cancelled','refunded'));
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookingStatus_check" CHECK ("bookingStatus" IN ('paid_booking_pending','confirmed','reservation_failed','compensation_pending','refunded','manual_review_required'));
ALTER TABLE "BookingAttempt" ADD CONSTRAINT "BookingAttempt_status_check" CHECK ("status" IN ('SELECTED','PRICE_VALIDATED','RESERVED','CONFIRMED','FAILED','UNKNOWN'));
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_status_check" CHECK ("status" IN ('requested','processing','completed','failed'));

CREATE OR REPLACE FUNCTION prevent_finalized_order_financial_mutation() RETURNS trigger AS $$
BEGIN
  IF OLD."paymentStatus" IN ('paid', 'refunded') AND (
    NEW."total" <> OLD."total" OR NEW."currency" <> OLD."currency" OR
    NEW."pricingSnapshot" IS DISTINCT FROM OLD."pricingSnapshot" OR
    NEW."paymentSnapshot" IS DISTINCT FROM OLD."paymentSnapshot" OR
    NEW."serviceSnapshot" IS DISTINCT FROM OLD."serviceSnapshot"
  ) THEN
    RAISE EXCEPTION 'finalized order financial snapshots are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Order_financial_snapshots_immutable"
BEFORE UPDATE ON "Order"
FOR EACH ROW EXECUTE FUNCTION prevent_finalized_order_financial_mutation();
