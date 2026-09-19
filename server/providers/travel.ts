import { randomUUID } from "node:crypto";
import { ProviderError } from "./types.js";

export type SupplierItem = { id: string; [key: string]: unknown };
export type SupplierQuery = Record<string, unknown>;
export type Reservation = { reservationId: string; providerReference: string; status: "reserved" | "confirmed" | "cancelled" | "refunded"; item: SupplierItem; payload?: Record<string, unknown> };
export type RevalidationOutcome = "VALID" | "PRICE_CHANGED" | "SOLD_OUT" | "EXPIRED" | "PROVIDER_UNAVAILABLE";
export type RevalidationResult = { outcome: RevalidationOutcome; trustedItem?: SupplierItem; trustedPrice?: number; reason?: string };
export type ReservationResolution = { outcome: "CONFIRMED" | "FAILED" | "UNKNOWN"; reservation?: Reservation; errorCode?: string };

export interface TravelSupplier {
  readonly name: string;
  search(query: SupplierQuery): Promise<SupplierItem[]>;
  validate(item: SupplierItem, query?: SupplierQuery): Promise<{ valid: boolean; price?: number; errors?: string[] }>;
  revalidate(item: SupplierItem, query?: SupplierQuery): Promise<RevalidationResult>;
  reserve(item: SupplierItem, query?: SupplierQuery): Promise<Reservation>;
  confirm(reservation: Reservation): Promise<Reservation>;
  cancel(reservation: Reservation): Promise<Reservation>;
  refund(reservation: Reservation): Promise<Reservation>;
  checkReservation(input: { providerReference?: string; idempotencyKey?: string }): Promise<ReservationResolution>;
}

export type FlightSupplier = TravelSupplier;
export type HotelSupplier = TravelSupplier;
export type TrainSupplier = TravelSupplier;
export type BusSupplier = TravelSupplier;
export type InsuranceSupplier = TravelSupplier;
export type CipSupplier = TravelSupplier;
export type TransferSupplier = TravelSupplier;
export type VisaProvider = TravelSupplier;

export class MockTravelSupplier implements TravelSupplier {
  private readonly reservations = new Map<string, Reservation>();
  private readonly reservationKeys = new Map<string, string>();
  private readonly unresolved = new Map<string, ReservationResolution>();
  constructor(public readonly name: string, private readonly catalog: SupplierItem[] = []) {}

  async search(query: SupplierQuery) {
    return this.catalog.filter((item) => Object.entries(query).every(([key, value]) => {
      if (value === undefined || value === null || value === "") return true;
      if (key === "q") return JSON.stringify(item).toLowerCase().includes(String(value).toLowerCase());
      return String(item[key] ?? "").toLowerCase() === String(value).toLowerCase();
    }));
  }
  async validate(item: SupplierItem) {
    const candidate = this.catalog.find((entry) => entry.id === item.id);
    return candidate ? { valid: true, price: typeof candidate.price === "number" ? candidate.price : undefined } : { valid: false, errors: ["ITEM_NOT_FOUND"] };
  }
  async revalidate(item: SupplierItem): Promise<RevalidationResult> {
    const candidate = this.catalog.find((entry) => entry.id === item.id);
    if (!candidate) return { outcome: "SOLD_OUT", reason: "ITEM_NOT_FOUND" };
    if (candidate.mockAvailability === "sold_out") return { outcome: "SOLD_OUT", trustedItem: candidate };
    if (candidate.mockAvailability === "expired") return { outcome: "EXPIRED", trustedItem: candidate };
    if (candidate.mockAvailability === "unavailable") return { outcome: "PROVIDER_UNAVAILABLE", trustedItem: candidate };
    const trustedPrice = typeof candidate.price === "number" ? candidate.price : undefined;
    if (typeof item.price === "number" && trustedPrice !== undefined && item.price !== trustedPrice) return { outcome: "PRICE_CHANGED", trustedItem: candidate, trustedPrice };
    return { outcome: "VALID", trustedItem: candidate, trustedPrice };
  }
  async reserve(item: SupplierItem, query: SupplierQuery = {}) {
    const key = typeof query.idempotencyKey === "string" ? query.idempotencyKey : undefined;
    const existingId = key ? this.reservationKeys.get(key) : undefined;
    if (existingId) {
      const existing = this.reservations.get(existingId);
      if (existing) return existing;
      const pending = this.unresolved.get(key);
      if (pending?.outcome === "UNKNOWN") throw new ProviderError("PROVIDER_TIMEOUT", "Reservation outcome is unknown", true, this.name);
    }
    const validation = await this.validate(item);
    if (!validation.valid) throw new ProviderError("NOT_FOUND", "Supplier item was not found", false, this.name);
    const candidate = this.catalog.find((entry) => entry.id === item.id)!;
    if (candidate.mockBookingOutcome === "failed") throw new ProviderError("INVALID_REQUEST", "Supplier rejected reservation", false, this.name);
    if (candidate.mockBookingOutcome === "unknown") {
      if (key) this.unresolved.set(key, { outcome: "UNKNOWN" });
      throw new ProviderError("PROVIDER_TIMEOUT", "Reservation outcome is unknown", true, this.name);
    }
    const reservation = { reservationId: randomUUID(), providerReference: `MOCK-${this.name.toUpperCase()}-${randomUUID().slice(0, 10)}`, status: "reserved" as const, item: candidate };
    this.reservations.set(reservation.reservationId, reservation);
    if (key) this.reservationKeys.set(key, reservation.reservationId);
    return reservation;
  }
  async confirm(reservation: Reservation) { return this.update(reservation, "confirmed", ["reserved"]); }
  async cancel(reservation: Reservation) { return this.update(reservation, "cancelled", ["reserved", "confirmed"]); }
  async refund(reservation: Reservation) { return this.update(reservation, "refunded", ["confirmed", "cancelled"]); }
  async checkReservation(input: { providerReference?: string; idempotencyKey?: string }): Promise<ReservationResolution> {
    if (input.idempotencyKey) {
      const unresolved = this.unresolved.get(input.idempotencyKey);
      if (unresolved) return unresolved;
      const id = this.reservationKeys.get(input.idempotencyKey);
      const reservation = id ? this.reservations.get(id) : undefined;
      if (reservation) return { outcome: reservation.status === "confirmed" ? "CONFIRMED" : "UNKNOWN", reservation };
    }
    const reservation = [...this.reservations.values()].find((entry) => entry.providerReference === input.providerReference);
    return reservation ? { outcome: reservation.status === "confirmed" ? "CONFIRMED" : "UNKNOWN", reservation } : { outcome: "FAILED", errorCode: "NOT_FOUND" };
  }
  resolveUnknown(idempotencyKey: string, outcome: "CONFIRMED" | "FAILED", item?: SupplierItem) {
    if (outcome === "FAILED") { this.unresolved.set(idempotencyKey, { outcome }); return; }
    const selected = item ?? this.catalog[0];
    const reservation = { reservationId: randomUUID(), providerReference: `MOCK-${this.name.toUpperCase()}-${randomUUID().slice(0, 10)}`, status: "confirmed" as const, item: selected };
    this.reservations.set(reservation.reservationId, reservation);
    this.reservationKeys.set(idempotencyKey, reservation.reservationId);
    this.unresolved.set(idempotencyKey, { outcome, reservation });
  }
  private update(reservation: Reservation, status: Reservation["status"], allowed: Reservation["status"][]) {
    const current = this.reservations.get(reservation.reservationId);
    if (!current) throw new ProviderError("NOT_FOUND", "Reservation was not found", false, this.name);
    if (!allowed.includes(current.status)) throw new ProviderError("INVALID_REQUEST", `Cannot ${status} a ${current.status} reservation`, false, this.name);
    const updated = { ...current, status };
    this.reservations.set(updated.reservationId, updated);
    return Promise.resolve(updated);
  }
}

export class MockFlightSupplier extends MockTravelSupplier implements FlightSupplier { constructor(catalog: SupplierItem[] = []) { super("flight-mock", catalog); } }
export class MockHotelSupplier extends MockTravelSupplier implements HotelSupplier { constructor(catalog: SupplierItem[] = []) { super("hotel-mock", catalog); } }
export class MockTrainSupplier extends MockTravelSupplier implements TrainSupplier { constructor(catalog: SupplierItem[] = []) { super("train-mock", catalog); } }
export class MockBusSupplier extends MockTravelSupplier implements BusSupplier { constructor(catalog: SupplierItem[] = []) { super("bus-mock", catalog); } }
export class MockInsuranceSupplier extends MockTravelSupplier implements InsuranceSupplier { constructor(catalog: SupplierItem[] = []) { super("insurance-mock", catalog); } }
export class MockCipSupplier extends MockTravelSupplier implements CipSupplier { constructor(catalog: SupplierItem[] = []) { super("cip-mock", catalog); } }
export class MockTransferSupplier extends MockTravelSupplier implements TransferSupplier { constructor(catalog: SupplierItem[] = []) { super("transfer-mock", catalog); } }
export class MockVisaProvider extends MockTravelSupplier implements VisaProvider { constructor(catalog: SupplierItem[] = []) { super("visa-mock", catalog); } }
