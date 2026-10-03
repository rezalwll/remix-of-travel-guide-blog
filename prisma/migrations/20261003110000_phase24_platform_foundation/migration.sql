-- Organization and RBAC foundation
CREATE TABLE "Organization" (
  "id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "legalName" TEXT,
  "slug" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "contactEmail" TEXT,
  "contactMobile" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Organization_type_check" CHECK ("type" IN ('KIASHI_INTERNAL', 'MERCHANT', 'SUPPLIER', 'PARTNER')),
  CONSTRAINT "Organization_status_check" CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'DISABLED'))
);

CREATE TABLE "MerchantProfile" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "merchantCode" TEXT NOT NULL,
  "businessType" TEXT NOT NULL,
  "onboardingStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "contractStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "settlementStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
  "legalIdentifier" TEXT,
  "taxIdentifier" TEXT,
  "supportPhone" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MerchantProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MerchantProfile_onboarding_status_check" CHECK ("onboardingStatus" IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  CONSTRAINT "MerchantProfile_contract_status_check" CHECK ("contractStatus" IN ('NOT_STARTED', 'PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED')),
  CONSTRAINT "MerchantProfile_settlement_status_check" CHECK ("settlementStatus" IN ('INACTIVE', 'ACTIVE', 'SUSPENDED'))
);

CREATE TABLE "OrganizationMembership" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "invitedAt" TIMESTAMP(3),
  "joinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrganizationMembership_status_check" CHECK ("status" IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED'))
);

CREATE TABLE "Role" (
  "id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "description" TEXT,
  "isSystem" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Role_scope_check" CHECK ("scope" IN ('INTERNAL', 'MERCHANT'))
);

CREATE TABLE "Permission" (
  "id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RolePermission" (
  "roleId" UUID NOT NULL,
  "permissionId" UUID NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE TABLE "MembershipRole" (
  "membershipId" UUID NOT NULL,
  "roleId" UUID NOT NULL,
  CONSTRAINT "MembershipRole_pkey" PRIMARY KEY ("membershipId", "roleId")
);

CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL,
  "actorUserId" UUID,
  "actorOrganizationId" UUID,
  "targetOrganizationId" UUID,
  "action" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "beforeData" JSONB,
  "afterData" JSONB,
  "metadata" JSONB,
  "requestId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Merchant attribution on authoritative order and booking records
ALTER TABLE "Order"
  ADD COLUMN "merchantOrganizationId" UUID,
  ADD COLUMN "supplierOrganizationId" UUID;

ALTER TABLE "BookingAttempt"
  ADD COLUMN "merchantOrganizationId" UUID,
  ADD COLUMN "supplierOrganizationId" UUID;

-- Commercial terms, append-only ledger, settlement periods, and onboarding evidence
CREATE TABLE "CommissionRule" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "serviceType" TEXT NOT NULL,
  "calculationType" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TOMAN',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "activeFrom" TIMESTAMP(3) NOT NULL,
  "activeTo" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CommissionRule_calculation_check" CHECK ("calculationType" IN ('PERCENT', 'FIXED')),
  CONSTRAINT "CommissionRule_status_check" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
  CONSTRAINT "CommissionRule_value_nonnegative" CHECK ("value" >= 0),
  CONSTRAINT "CommissionRule_period_valid" CHECK ("activeTo" IS NULL OR "activeTo" > "activeFrom")
);

CREATE TABLE "SettlementBatch" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "grossAmount" INTEGER NOT NULL DEFAULT 0,
  "commissionAmount" INTEGER NOT NULL DEFAULT 0,
  "refundAmount" INTEGER NOT NULL DEFAULT 0,
  "adjustmentAmount" INTEGER NOT NULL DEFAULT 0,
  "payableAmount" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'TOMAN',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "externalReference" TEXT,
  "notes" TEXT,
  "approvedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SettlementBatch_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SettlementBatch_status_check" CHECK ("status" IN ('DRAFT', 'READY', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED')),
  CONSTRAINT "SettlementBatch_period_valid" CHECK ("periodEnd" > "periodStart"),
  CONSTRAINT "SettlementBatch_amounts_nonnegative" CHECK ("grossAmount" >= 0 AND "commissionAmount" >= 0 AND "refundAmount" >= 0 AND "payableAmount" >= 0)
);

CREATE TABLE "MerchantLedgerEntry" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "orderId" UUID,
  "bookingAttemptId" UUID,
  "settlementBatchId" UUID,
  "type" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TOMAN',
  "status" TEXT NOT NULL DEFAULT 'POSTED',
  "reference" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MerchantLedgerEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MerchantLedgerEntry_status_check" CHECK ("status" IN ('PENDING', 'POSTED', 'VOID'))
);

CREATE TABLE "MerchantDocument" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "storageReference" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MerchantDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MerchantDocument_status_check" CHECK ("status" IN ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'))
);

-- Unique constraints and query-path indexes
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX "Organization_type_status_idx" ON "Organization"("type", "status");
CREATE UNIQUE INDEX "MerchantProfile_organizationId_key" ON "MerchantProfile"("organizationId");
CREATE UNIQUE INDEX "MerchantProfile_merchantCode_key" ON "MerchantProfile"("merchantCode");
CREATE INDEX "MerchantProfile_businessType_onboardingStatus_idx" ON "MerchantProfile"("businessType", "onboardingStatus");
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");
CREATE INDEX "OrganizationMembership_userId_status_idx" ON "OrganizationMembership"("userId", "status");
CREATE INDEX "OrganizationMembership_organizationId_status_idx" ON "OrganizationMembership"("organizationId", "status");
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");
CREATE INDEX "Role_scope_idx" ON "Role"("scope");
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");
CREATE INDEX "MembershipRole_roleId_idx" ON "MembershipRole"("roleId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");
CREATE INDEX "AuditLog_resourceType_resourceId_createdAt_idx" ON "AuditLog"("resourceType", "resourceId", "createdAt");
CREATE INDEX "AuditLog_targetOrganizationId_createdAt_idx" ON "AuditLog"("targetOrganizationId", "createdAt");
CREATE INDEX "Order_merchantOrganizationId_createdAt_idx" ON "Order"("merchantOrganizationId", "createdAt");
CREATE INDEX "Order_supplierOrganizationId_createdAt_idx" ON "Order"("supplierOrganizationId", "createdAt");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "Order_serviceType_createdAt_idx" ON "Order"("serviceType", "createdAt");
CREATE INDEX "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");
CREATE INDEX "Order_bookingStatus_createdAt_idx" ON "Order"("bookingStatus", "createdAt");
CREATE INDEX "PaymentAttempt_status_createdAt_idx" ON "PaymentAttempt"("status", "createdAt");
CREATE INDEX "RefundRequest_status_createdAt_idx" ON "RefundRequest"("status", "createdAt");
CREATE INDEX "BookingAttempt_merchantOrganizationId_createdAt_idx" ON "BookingAttempt"("merchantOrganizationId", "createdAt");
CREATE INDEX "BookingAttempt_supplierOrganizationId_createdAt_idx" ON "BookingAttempt"("supplierOrganizationId", "createdAt");
CREATE INDEX "CommissionRule_organizationId_serviceType_status_idx" ON "CommissionRule"("organizationId", "serviceType", "status");
CREATE INDEX "CommissionRule_activeFrom_activeTo_idx" ON "CommissionRule"("activeFrom", "activeTo");
CREATE UNIQUE INDEX "MerchantLedgerEntry_reference_key" ON "MerchantLedgerEntry"("reference");
CREATE INDEX "MerchantLedgerEntry_organizationId_createdAt_idx" ON "MerchantLedgerEntry"("organizationId", "createdAt");
CREATE INDEX "MerchantLedgerEntry_organizationId_type_createdAt_idx" ON "MerchantLedgerEntry"("organizationId", "type", "createdAt");
CREATE INDEX "MerchantLedgerEntry_orderId_idx" ON "MerchantLedgerEntry"("orderId");
CREATE INDEX "MerchantLedgerEntry_settlementBatchId_idx" ON "MerchantLedgerEntry"("settlementBatchId");
CREATE INDEX "SettlementBatch_organizationId_periodStart_periodEnd_idx" ON "SettlementBatch"("organizationId", "periodStart", "periodEnd");
CREATE INDEX "SettlementBatch_organizationId_status_createdAt_idx" ON "SettlementBatch"("organizationId", "status", "createdAt");
CREATE INDEX "MerchantDocument_organizationId_type_status_idx" ON "MerchantDocument"("organizationId", "type", "status");
CREATE INDEX "MerchantDocument_expiresAt_idx" ON "MerchantDocument"("expiresAt");

-- Referential integrity
ALTER TABLE "MerchantProfile" ADD CONSTRAINT "MerchantProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembershipRole" ADD CONSTRAINT "MembershipRole_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganizationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembershipRole" ADD CONSTRAINT "MembershipRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorOrganizationId_fkey" FOREIGN KEY ("actorOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_targetOrganizationId_fkey" FOREIGN KEY ("targetOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_merchantOrganizationId_fkey" FOREIGN KEY ("merchantOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierOrganizationId_fkey" FOREIGN KEY ("supplierOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookingAttempt" ADD CONSTRAINT "BookingAttempt_merchantOrganizationId_fkey" FOREIGN KEY ("merchantOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookingAttempt" ADD CONSTRAINT "BookingAttempt_supplierOrganizationId_fkey" FOREIGN KEY ("supplierOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommissionRule" ADD CONSTRAINT "CommissionRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SettlementBatch" ADD CONSTRAINT "SettlementBatch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MerchantLedgerEntry" ADD CONSTRAINT "MerchantLedgerEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MerchantLedgerEntry" ADD CONSTRAINT "MerchantLedgerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MerchantLedgerEntry" ADD CONSTRAINT "MerchantLedgerEntry_bookingAttemptId_fkey" FOREIGN KEY ("bookingAttemptId") REFERENCES "BookingAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MerchantLedgerEntry" ADD CONSTRAINT "MerchantLedgerEntry_settlementBatchId_fkey" FOREIGN KEY ("settlementBatchId") REFERENCES "SettlementBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MerchantDocument" ADD CONSTRAINT "MerchantDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Audit and merchant ledgers are append-only. Corrections are new records.
CREATE OR REPLACE FUNCTION prevent_append_only_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only; create a compensating record instead', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AuditLog_append_only"
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_mutation();

CREATE TRIGGER "MerchantLedgerEntry_append_only"
BEFORE UPDATE OR DELETE ON "MerchantLedgerEntry"
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_mutation();
