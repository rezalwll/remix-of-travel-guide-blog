export const providerFixtures = Object.freeze({
  sms: { accepted: { status: "queued", providerReference: "STUB-SMS-001" }, rejected: { status: "failed", errorCode: "INVALID_RECIPIENT" } },
  payment: { pending: { status: "pending", externalReference: "STUB-PAY-001" }, succeeded: { status: "succeeded", externalReference: "STUB-PAY-001" } },
  travel: { item: { id: "STUB-OFFER-001", price: 1_250_000, currency: "TOMAN", available: true }, reserved: { reservationId: "STUB-RES-001", providerReference: "STUB-BOOK-001", status: "reserved" } },
});
