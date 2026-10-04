-- Phase 25D: persist exact direct-hotel allocations so inventory release is auditable and idempotent.
CREATE TABLE "HotelInventoryAllocation" (
  "id" UUID NOT NULL,
  "orderId" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "propertyId" UUID NOT NULL,
  "roomTypeId" UUID NOT NULL,
  "ratePlanId" UUID NOT NULL,
  "checkIn" DATE NOT NULL,
  "checkOut" DATE NOT NULL,
  "roomCount" INTEGER NOT NULL,
  "sourceType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "releasedByRefundId" UUID,
  "releaseReason" TEXT,
  "releasedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HotelInventoryAllocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HotelInventoryAllocation_room_count_check" CHECK ("roomCount" BETWEEN 1 AND 20),
  CONSTRAINT "HotelInventoryAllocation_dates_check" CHECK ("checkOut" > "checkIn"),
  CONSTRAINT "HotelInventoryAllocation_source_check" CHECK ("sourceType" IN ('DIRECT','DEMO')),
  CONSTRAINT "HotelInventoryAllocation_status_check" CHECK ("status" IN ('ACTIVE','RELEASED')),
  CONSTRAINT "HotelInventoryAllocation_release_check" CHECK (
    ("status" = 'ACTIVE' AND "releasedAt" IS NULL AND "releasedByRefundId" IS NULL)
    OR ("status" = 'RELEASED' AND "releasedAt" IS NOT NULL AND "releasedByRefundId" IS NOT NULL)
  )
);

CREATE UNIQUE INDEX "HotelInventoryAllocation_orderId_key" ON "HotelInventoryAllocation"("orderId");
CREATE UNIQUE INDEX "HotelInventoryAllocation_releasedByRefundId_key" ON "HotelInventoryAllocation"("releasedByRefundId");
CREATE INDEX "HotelInventoryAllocation_organizationId_status_idx" ON "HotelInventoryAllocation"("organizationId", "status");
CREATE INDEX "HotelInventoryAllocation_ratePlanId_checkIn_checkOut_idx" ON "HotelInventoryAllocation"("ratePlanId", "checkIn", "checkOut");

ALTER TABLE "HotelInventoryAllocation" ADD CONSTRAINT "HotelInventoryAllocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HotelInventoryAllocation" ADD CONSTRAINT "HotelInventoryAllocation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HotelInventoryAllocation" ADD CONSTRAINT "HotelInventoryAllocation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HotelInventoryAllocation" ADD CONSTRAINT "HotelInventoryAllocation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HotelInventoryAllocation" ADD CONSTRAINT "HotelInventoryAllocation_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
