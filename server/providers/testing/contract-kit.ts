import { expect } from "vitest";
import type { PaymentGateway } from "../payment.js";
import type { SmsProvider } from "../sms.js";
import type { TravelSupplier } from "../travel.js";

export async function verifySmsContract(provider: SmsProvider) {
  const sent = await provider.send({ mobile: "09120000000", template: "OTP_LOGIN", variables: { code: "00000" }, idempotencyKey: "contract-sms" });
  expect(["queued", "sent"]).toContain(sent.status);
  expect(sent.providerReference).toBeTruthy();
  expect(JSON.stringify(sent)).not.toContain("00000");
}

export async function verifyPaymentContract(gateway: PaymentGateway) {
  const created = await gateway.createPayment({ amount: 10_000, currency: "TOMAN", idempotencyKey: "contract-pay", callbackUrl: "http://localhost/callback" });
  expect(created.externalReference).toBeTruthy();
  expect((await gateway.verifyPayment({ externalReference: created.externalReference })).status).toBe("pending");
  if (gateway.createTestCallback) expect((await gateway.verifyPayment({ externalReference: created.externalReference, callback: gateway.createTestCallback(created.externalReference, "succeeded") })).status).toBe("succeeded");
}

export async function verifyTravelContract(supplier: TravelSupplier) {
  const items = await supplier.search({});
  expect(items.length).toBeGreaterThan(0);
  expect((await supplier.revalidate(items[0])).outcome).toBe("VALID");
  const reservation = await supplier.reserve(items[0], { idempotencyKey: `contract-${supplier.name}` });
  expect((await supplier.confirm(reservation)).status).toBe("confirmed");
}
