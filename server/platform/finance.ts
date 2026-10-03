import { DomainError } from "../domain/errors.js";

export type CommissionRuleInput = {
  calculationType: "PERCENT" | "FIXED";
  /** Percentage rules store basis points: 100 = 1%, 1_000 = 10%. */
  value: number;
};

function assertMoney(value: number, field: string, allowNegative = false) {
  if (!Number.isSafeInteger(value) || (!allowNegative && value < 0)) {
    throw new DomainError("INVALID_MONEY", `${field} باید عدد صحیح معتبر بر حسب تومان باشد`, 400);
  }
}

export function calculateCommission(grossAmount: number, rule: CommissionRuleInput) {
  assertMoney(grossAmount, "مبلغ ناخالص");
  assertMoney(rule.value, "مقدار کمیسیون");
  const raw = rule.calculationType === "PERCENT"
    ? Math.floor((grossAmount * rule.value) / 10_000)
    : rule.value;
  return Math.min(grossAmount, raw);
}

export type SettlementInput = {
  grossAmount: number;
  commissionAmount: number;
  refundAmount: number;
  adjustmentAmount: number;
};

export function calculateSettlement(input: SettlementInput) {
  assertMoney(input.grossAmount, "فروش ناخالص");
  assertMoney(input.commissionAmount, "کمیسیون");
  assertMoney(input.refundAmount, "بازپرداخت");
  assertMoney(input.adjustmentAmount, "تعدیل", true);
  const calculated = input.grossAmount - input.commissionAmount - input.refundAmount + input.adjustmentAmount;
  return { ...input, payableAmount: Math.max(0, calculated), carryForwardAmount: Math.min(0, calculated) };
}

export const settlementTransitions = {
  DRAFT: ["READY", "CANCELLED"],
  READY: ["DRAFT", "APPROVED", "CANCELLED"],
  APPROVED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PAID", "FAILED"],
  FAILED: ["READY", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
} as const;

export type SettlementStatus = keyof typeof settlementTransitions;

export function canTransitionSettlement(from: SettlementStatus, to: SettlementStatus) {
  return (settlementTransitions[from] as readonly string[]).includes(to);
}

