export const MONEY_CURRENCY = "TOMAN" as const;

export function toGatewayRial(toman: number): number {
  if (!Number.isSafeInteger(toman) || toman < 0) throw new RangeError("Toman amount must be a non-negative integer");
  return toman * 10;
}

export function fromGatewayRial(rial: number): number {
  if (!Number.isSafeInteger(rial) || rial < 0 || rial % 10 !== 0) throw new RangeError("Rial amount must be a non-negative multiple of 10");
  return rial / 10;
}
