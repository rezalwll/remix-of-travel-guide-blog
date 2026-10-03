-- Phase 25A: shared tour and ziyarat operations domain.
CREATE TABLE "TravelProgram" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "shortDescription" TEXT,
  "description" TEXT NOT NULL,
  "origin" TEXT NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "durationNights" INTEGER NOT NULL,
  "sourceType" TEXT NOT NULL DEFAULT 'DIRECT',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "futureSalePolicy" BOOLEAN NOT NULL DEFAULT false,
  "visaNote" TEXT,
  "cancellationPolicy" TEXT NOT NULL,
  "guideNote" TEXT,
  "submittedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TravelProgram_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TravelProgram_type_check" CHECK ("type" IN ('TOUR', 'ZIYARAT')),
  CONSTRAINT "TravelProgram_source_type_check" CHECK ("sourceType" IN ('DIRECT', 'DEMO')),
  CONSTRAINT "TravelProgram_status_check" CHECK ("status" IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
  CONSTRAINT "TravelProgram_publication_status_check" CHECK ("publicationStatus" IN ('DRAFT', 'SUBMITTED', 'NEEDS_CHANGES', 'REJECTED', 'PUBLISHED', 'PAUSED', 'ARCHIVED')),
  CONSTRAINT "TravelProgram_duration_check" CHECK ("durationDays" > 0 AND "durationNights" >= 0 AND "durationNights" <= "durationDays")
);

CREATE TABLE "TravelProgramDestination" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "city" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "TravelProgramDestination_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TravelProgramDeparture" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "transportType" TEXT NOT NULL,
  "transportDetails" TEXT,
  "totalCapacity" INTEGER NOT NULL,
  "heldCapacity" INTEGER NOT NULL DEFAULT 0,
  "saleStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "salesStartAt" TIMESTAMP(3),
  "salesEndAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TravelProgramDeparture_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TravelProgramDeparture_status_check" CHECK ("saleStatus" IN ('DRAFT', 'OPEN', 'LOW_CAPACITY', 'FULL', 'CLOSED', 'DEPARTED', 'CANCELLED')),
  CONSTRAINT "TravelProgramDeparture_dates_check" CHECK ("endDate" >= "startDate"),
  CONSTRAINT "TravelProgramDeparture_capacity_check" CHECK ("totalCapacity" >= 0 AND "heldCapacity" >= 0 AND "heldCapacity" <= "totalCapacity"),
  CONSTRAINT "TravelProgramDeparture_sales_dates_check" CHECK ("salesEndAt" IS NULL OR "salesStartAt" IS NULL OR "salesEndAt" >= "salesStartAt")
);

CREATE TABLE "TravelProgramPackage" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "departureId" UUID,
  "name" TEXT NOT NULL,
  "hotelName" TEXT,
  "hotelStars" INTEGER,
  "roomType" TEXT,
  "mealPlan" TEXT,
  "transport" TEXT,
  "adultPrice" INTEGER NOT NULL,
  "childPrice" INTEGER NOT NULL,
  "infantPrice" INTEGER NOT NULL DEFAULT 0,
  "singleSupplement" INTEGER NOT NULL DEFAULT 0,
  "capacity" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TravelProgramPackage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TravelProgramPackage_status_check" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
  CONSTRAINT "TravelProgramPackage_hotel_stars_check" CHECK ("hotelStars" IS NULL OR ("hotelStars" >= 1 AND "hotelStars" <= 5)),
  CONSTRAINT "TravelProgramPackage_price_check" CHECK ("adultPrice" >= 0 AND "childPrice" >= 0 AND "infantPrice" >= 0 AND "singleSupplement" >= 0),
  CONSTRAINT "TravelProgramPackage_capacity_check" CHECK ("capacity" IS NULL OR "capacity" >= 0)
);

CREATE TABLE "TravelProgramItineraryDay" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "dayNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "accommodation" TEXT,
  "meals" TEXT,
  "transportNote" TEXT,
  "activityNote" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "TravelProgramItineraryDay_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TravelProgramItineraryDay_number_check" CHECK ("dayNumber" > 0)
);

CREATE TABLE "TravelProgramContentItem" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "kind" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "TravelProgramContentItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TravelProgramContentItem_kind_check" CHECK ("kind" IN ('INCLUDED_SERVICE', 'EXCLUDED_SERVICE', 'REQUIRED_DOCUMENT', 'TRAVELER_NOTE', 'PILGRIMAGE_NOTE', 'ACCOMMODATION_SPLIT'))
);

CREATE TABLE "TravelProgramMedia" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "altText" TEXT NOT NULL,
  "isCover" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "TravelProgramMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TravelProgramModerationEvent" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "actorUserId" UUID NOT NULL,
  "actorOrganizationId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TravelProgramModerationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TravelRegistrationNote" (
  "id" UUID NOT NULL,
  "orderId" UUID NOT NULL,
  "actorUserId" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TravelRegistrationNote_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order"
  ADD COLUMN "travelProgramId" UUID,
  ADD COLUMN "travelProgramDepartureId" UUID,
  ADD COLUMN "travelProgramPackageId" UUID;

CREATE UNIQUE INDEX "TravelProgram_slug_key" ON "TravelProgram"("slug");
CREATE INDEX "TravelProgram_organizationId_type_publicationStatus_idx" ON "TravelProgram"("organizationId", "type", "publicationStatus");
CREATE INDEX "TravelProgram_type_publicationStatus_featured_idx" ON "TravelProgram"("type", "publicationStatus", "featured");
CREATE INDEX "TravelProgram_status_updatedAt_idx" ON "TravelProgram"("status", "updatedAt");
CREATE INDEX "TravelProgramDestination_programId_sortOrder_idx" ON "TravelProgramDestination"("programId", "sortOrder");
CREATE INDEX "TravelProgramDestination_city_country_idx" ON "TravelProgramDestination"("city", "country");
CREATE INDEX "TravelProgramDeparture_programId_startDate_idx" ON "TravelProgramDeparture"("programId", "startDate");
CREATE INDEX "TravelProgramDeparture_saleStatus_startDate_idx" ON "TravelProgramDeparture"("saleStatus", "startDate");
CREATE INDEX "TravelProgramPackage_programId_status_idx" ON "TravelProgramPackage"("programId", "status");
CREATE INDEX "TravelProgramPackage_departureId_status_idx" ON "TravelProgramPackage"("departureId", "status");
CREATE UNIQUE INDEX "TravelProgramItineraryDay_programId_dayNumber_key" ON "TravelProgramItineraryDay"("programId", "dayNumber");
CREATE INDEX "TravelProgramItineraryDay_programId_sortOrder_idx" ON "TravelProgramItineraryDay"("programId", "sortOrder");
CREATE INDEX "TravelProgramContentItem_programId_kind_sortOrder_idx" ON "TravelProgramContentItem"("programId", "kind", "sortOrder");
CREATE INDEX "TravelProgramMedia_programId_sortOrder_idx" ON "TravelProgramMedia"("programId", "sortOrder");
CREATE UNIQUE INDEX "TravelProgramMedia_one_cover_per_program" ON "TravelProgramMedia"("programId") WHERE "isCover" = true;
CREATE INDEX "TravelProgramModerationEvent_programId_createdAt_idx" ON "TravelProgramModerationEvent"("programId", "createdAt");
CREATE INDEX "TravelProgramModerationEvent_toStatus_createdAt_idx" ON "TravelProgramModerationEvent"("toStatus", "createdAt");
CREATE INDEX "TravelRegistrationNote_orderId_createdAt_idx" ON "TravelRegistrationNote"("orderId", "createdAt");
CREATE INDEX "Order_travelProgramId_createdAt_idx" ON "Order"("travelProgramId", "createdAt");
CREATE INDEX "Order_travelProgramDepartureId_createdAt_idx" ON "Order"("travelProgramDepartureId", "createdAt");
CREATE INDEX "Order_travelProgramPackageId_createdAt_idx" ON "Order"("travelProgramPackageId", "createdAt");

ALTER TABLE "TravelProgram" ADD CONSTRAINT "TravelProgram_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TravelProgramDestination" ADD CONSTRAINT "TravelProgramDestination_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TravelProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramDeparture" ADD CONSTRAINT "TravelProgramDeparture_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TravelProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramPackage" ADD CONSTRAINT "TravelProgramPackage_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TravelProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramPackage" ADD CONSTRAINT "TravelProgramPackage_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "TravelProgramDeparture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramItineraryDay" ADD CONSTRAINT "TravelProgramItineraryDay_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TravelProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramContentItem" ADD CONSTRAINT "TravelProgramContentItem_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TravelProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramMedia" ADD CONSTRAINT "TravelProgramMedia_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TravelProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramModerationEvent" ADD CONSTRAINT "TravelProgramModerationEvent_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TravelProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelProgramModerationEvent" ADD CONSTRAINT "TravelProgramModerationEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TravelProgramModerationEvent" ADD CONSTRAINT "TravelProgramModerationEvent_actorOrganizationId_fkey" FOREIGN KEY ("actorOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TravelRegistrationNote" ADD CONSTRAINT "TravelRegistrationNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TravelRegistrationNote" ADD CONSTRAINT "TravelRegistrationNote_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_travelProgramId_fkey" FOREIGN KEY ("travelProgramId") REFERENCES "TravelProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_travelProgramDepartureId_fkey" FOREIGN KEY ("travelProgramDepartureId") REFERENCES "TravelProgramDeparture"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_travelProgramPackageId_fkey" FOREIGN KEY ("travelProgramPackageId") REFERENCES "TravelProgramPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
