-- Phase 25B: direct hotel inventory and operational links.
CREATE TABLE "Property" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL, "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL, "city" TEXT NOT NULL, "country" TEXT NOT NULL DEFAULT 'ایران',
  "address" TEXT NOT NULL, "area" TEXT, "latitude" DECIMAL(9,6), "longitude" DECIMAL(9,6),
  "stars" INTEGER NOT NULL, "description" TEXT NOT NULL,
  "checkInTime" TEXT NOT NULL DEFAULT '14:00', "checkOutTime" TEXT NOT NULL DEFAULT '12:00',
  "sourceType" TEXT NOT NULL DEFAULT 'DIRECT', "supplierCode" TEXT,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT', "operationalStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
  "amenities" JSONB, "policies" JSONB, "images" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Property_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Property_stars_check" CHECK ("stars" BETWEEN 1 AND 5),
  CONSTRAINT "Property_source_check" CHECK ("sourceType" IN ('DIRECT','SUPPLIER','HYBRID','DEMO')),
  CONSTRAINT "Property_publication_check" CHECK ("publicationStatus" IN ('DRAFT','SUBMITTED','NEEDS_CHANGES','REJECTED','PUBLISHED','PAUSED','ARCHIVED')),
  CONSTRAINT "Property_operational_check" CHECK ("operationalStatus" IN ('ACTIVE','INACTIVE','SUSPENDED')),
  CONSTRAINT "Property_supplier_code_check" CHECK ("sourceType" NOT IN ('SUPPLIER','HYBRID') OR "supplierCode" IS NOT NULL)
);
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE INDEX "Property_organizationId_publicationStatus_idx" ON "Property"("organizationId","publicationStatus");
CREATE INDEX "Property_city_publicationStatus_operationalStatus_idx" ON "Property"("city","publicationStatus","operationalStatus");
CREATE INDEX "Property_sourceType_operationalStatus_idx" ON "Property"("sourceType","operationalStatus");

CREATE TABLE "RoomType" (
  "id" UUID NOT NULL, "propertyId" UUID NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL, "bedType" TEXT NOT NULL, "sizeSqm" INTEGER, "amenities" JSONB, "images" JSONB,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RoomType_capacity_check" CHECK ("capacity" BETWEEN 1 AND 20),
  CONSTRAINT "RoomType_size_check" CHECK ("sizeSqm" IS NULL OR "sizeSqm" BETWEEN 5 AND 1000),
  CONSTRAINT "RoomType_status_check" CHECK ("status" IN ('ACTIVE','INACTIVE'))
);
CREATE UNIQUE INDEX "RoomType_propertyId_name_key" ON "RoomType"("propertyId","name");
CREATE INDEX "RoomType_propertyId_status_idx" ON "RoomType"("propertyId","status");

CREATE TABLE "RatePlan" (
  "id" UUID NOT NULL, "roomTypeId" UUID NOT NULL, "title" TEXT NOT NULL, "mealPlan" TEXT NOT NULL,
  "refundable" BOOLEAN NOT NULL DEFAULT false, "cancellationPolicy" TEXT NOT NULL, "baseRate" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TOMAN', "taxesIncluded" BOOLEAN NOT NULL DEFAULT true,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RatePlan_pkey" PRIMARY KEY ("id"), CONSTRAINT "RatePlan_rate_check" CHECK ("baseRate" >= 0),
  CONSTRAINT "RatePlan_status_check" CHECK ("status" IN ('ACTIVE','INACTIVE'))
);
CREATE UNIQUE INDEX "RatePlan_roomTypeId_title_key" ON "RatePlan"("roomTypeId","title");
CREATE INDEX "RatePlan_roomTypeId_status_idx" ON "RatePlan"("roomTypeId","status");

CREATE TABLE "DailyInventory" (
  "id" UUID NOT NULL, "ratePlanId" UUID NOT NULL, "date" DATE NOT NULL, "availableRooms" INTEGER NOT NULL,
  "priceOverride" INTEGER, "closed" BOOLEAN NOT NULL DEFAULT false, "minimumStay" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyInventory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DailyInventory_available_check" CHECK ("availableRooms" BETWEEN 0 AND 100000),
  CONSTRAINT "DailyInventory_price_check" CHECK ("priceOverride" IS NULL OR "priceOverride" >= 0),
  CONSTRAINT "DailyInventory_stay_check" CHECK ("minimumStay" BETWEEN 1 AND 365)
);
CREATE UNIQUE INDEX "DailyInventory_ratePlanId_date_key" ON "DailyInventory"("ratePlanId","date");
CREATE INDEX "DailyInventory_date_closed_idx" ON "DailyInventory"("date","closed");

ALTER TABLE "Order" ADD COLUMN "propertyId" UUID, ADD COLUMN "roomTypeId" UUID, ADD COLUMN "ratePlanId" UUID;
CREATE INDEX "Order_propertyId_relevantDate_idx" ON "Order"("propertyId","relevantDate");
CREATE INDEX "Order_roomTypeId_relevantDate_idx" ON "Order"("roomTypeId","relevantDate");
CREATE INDEX "Order_ratePlanId_relevantDate_idx" ON "Order"("ratePlanId","relevantDate");

ALTER TABLE "SupportTicket" ADD COLUMN "orderId" UUID, ADD COLUMN "organizationId" UUID,
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general', ADD COLUMN "internalNote" TEXT;
ALTER TABLE "SupportMessage" ADD COLUMN "authorUserId" UUID, ADD COLUMN "internal" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "SupportTicket_organizationId_status_updatedAt_idx" ON "SupportTicket"("organizationId","status","updatedAt");
CREATE INDEX "SupportTicket_orderId_idx" ON "SupportTicket"("orderId");

ALTER TABLE "Property" ADD CONSTRAINT "Property_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RatePlan" ADD CONSTRAINT "RatePlan_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyInventory" ADD CONSTRAINT "DailyInventory_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
