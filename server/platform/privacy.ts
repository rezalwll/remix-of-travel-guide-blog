const keepDigits = (value: string) => value.replace(/\D/g, "");

export function maskMobile(value?: string | null) {
  if (!value) return null;
  const digits = keepDigits(value);
  if (digits.length < 7) return "***";
  return `${digits.slice(0, 4)}***${digits.slice(-4)}`;
}

export function maskEmail(value?: string | null) {
  if (!value) return null;
  const [local, domain] = value.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export function maskIdentifier(value?: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.length <= 4) return "****";
  return `${"*".repeat(Math.min(8, normalized.length - 4))}${normalized.slice(-4)}`;
}

type MerchantOrderSource = {
  id: string;
  orderNumber: string;
  trackingCode: string;
  serviceType: string;
  total: number;
  currency: string;
  paymentStatus: string;
  bookingStatus: string;
  relevantDate?: Date | string | null;
  createdAt: Date | string;
  buyer?: unknown;
  travelers?: unknown;
  summary?: unknown;
};

function recordOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function toMerchantOrderDto(order: MerchantOrderSource) {
  const buyer = recordOf(order.buyer);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    trackingCode: order.trackingCode,
    serviceType: order.serviceType,
    total: order.total,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    bookingStatus: order.bookingStatus,
    relevantDate: order.relevantDate ?? null,
    createdAt: order.createdAt,
    summary: order.summary ?? null,
    customer: {
      name: typeof buyer.name === "string" ? buyer.name : null,
      mobile: maskMobile(typeof buyer.mobile === "string" ? buyer.mobile : null),
      email: maskEmail(typeof buyer.email === "string" ? buyer.email : null),
      nationalId: maskIdentifier(typeof buyer.nationalId === "string" ? buyer.nationalId : null),
      passport: maskIdentifier(typeof buyer.passportNumber === "string" ? buyer.passportNumber : null),
    },
  };
}

