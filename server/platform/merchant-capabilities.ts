import { DomainError } from "../domain/errors.js";

export const merchantBusinessTypes = [
  "HOTEL",
  "TOUR_OPERATOR",
  "TRAVEL_AGENCY",
  "TRANSPORT_PROVIDER",
  "SERVICE_PROVIDER",
  "GENERAL_PARTNER",
] as const;

export const merchantCapabilities = [
  "MANAGE_HOTELS",
  "MANAGE_PROGRAMS",
  "VIEW_PROGRAM_REGISTRATIONS",
  "MANAGE_DIRECT_TRANSFER",
  "VIEW_PROVIDER_ORDERS",
  "MANAGE_TEAM",
  "VIEW_FINANCE",
] as const;

export type MerchantBusinessType = typeof merchantBusinessTypes[number];
export type MerchantCapability = typeof merchantCapabilities[number];

const common: MerchantCapability[] = ["VIEW_PROVIDER_ORDERS", "MANAGE_TEAM", "VIEW_FINANCE"];
const capabilityPolicy: Record<MerchantBusinessType, readonly MerchantCapability[]> = {
  HOTEL: [...common, "MANAGE_HOTELS"],
  TOUR_OPERATOR: [...common, "MANAGE_PROGRAMS", "VIEW_PROGRAM_REGISTRATIONS"],
  TRAVEL_AGENCY: common,
  TRANSPORT_PROVIDER: [...common, "MANAGE_DIRECT_TRANSFER"],
  SERVICE_PROVIDER: [...common, "MANAGE_DIRECT_TRANSFER"],
  GENERAL_PARTNER: common,
};

const permissionCapabilities: ReadonlyArray<[RegExp, MerchantCapability]> = [
  [/^merchant\.(hotels|inventory|bookings|guests)\./, "MANAGE_HOTELS"],
  [/^merchant\.(programs|departures)\./, "MANAGE_PROGRAMS"],
  [/^merchant\.(registrations|participants)\./, "VIEW_PROGRAM_REGISTRATIONS"],
  [/^merchant\.orders\./, "VIEW_PROVIDER_ORDERS"],
  [/^merchant\.team\./, "MANAGE_TEAM"],
  [/^merchant\.(finance|settlements|reports)\./, "VIEW_FINANCE"],
];

export function isMerchantBusinessType(value: string | null | undefined): value is MerchantBusinessType {
  return merchantBusinessTypes.includes(value as MerchantBusinessType);
}

export function capabilitiesForBusinessType(value: string | null | undefined): MerchantCapability[] {
  return isMerchantBusinessType(value) ? [...capabilityPolicy[value]] : [];
}

export function hasMerchantCapability(value: string | null | undefined, capability: MerchantCapability) {
  return capabilitiesForBusinessType(value).includes(capability);
}

export function capabilityForPermission(permission: string): MerchantCapability | undefined {
  return permissionCapabilities.find(([pattern]) => pattern.test(permission))?.[1];
}

export function requireMerchantPermissionCapability(value: string | null | undefined, permission: string) {
  const capability = capabilityForPermission(permission);
  if (capability && !hasMerchantCapability(value, capability)) {
    throw new DomainError("MERCHANT_CAPABILITY_DENIED", "این خدمت با نوع کسب‌وکار پذیرنده فعال نیست", 403);
  }
}
