import { randomUUID } from "node:crypto";
import { ProviderError } from "./types.js";

export type SupplierItem = { id: string; [key: string]: unknown };
export type SupplierQuery = Record<string, unknown>;
export type Reservation = { reservationId: string; providerReference: string; status: "reserved" | "confirmed" | "cancelled" | "refunded"; item: SupplierItem; payload?: Record<string, unknown> };

export interface TravelSupplier {
  readonly name: string;
  search(query: SupplierQuery): Promise<SupplierItem[]>;
  validate(item: SupplierItem, query?: SupplierQuery): Promise<{ valid: boolean; price?: number; errors?: string[] }>;
  reserve(item: SupplierItem, query?: SupplierQuery): Promise<Reservation>;
  confirm(reservation: Reservation): Promise<Reservation>;
  cancel(reservation: Reservation): Promise<Reservation>;
  refund(reservation: Reservation): Promise<Reservation>;
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
  async reserve(item: SupplierItem) {
    const validation = await this.validate(item);
    if (!validation.valid) throw new ProviderError("NOT_FOUND", "Supplier item was not found", false, this.name);
    const reservation = { reservationId: randomUUID(), providerReference: `MOCK-${this.name.toUpperCase()}-${randomUUID().slice(0, 10)}`, status: "reserved" as const, item: this.catalog.find((candidate) => candidate.id === item.id)! };
    this.reservations.set(reservation.reservationId, reservation);
    return reservation;
  }
  async confirm(reservation: Reservation) { return this.update(reservation, "confirmed", ["reserved"]); }
  async cancel(reservation: Reservation) { return this.update(reservation, "cancelled", ["reserved", "confirmed"]); }
  async refund(reservation: Reservation) { return this.update(reservation, "refunded", ["confirmed", "cancelled"]); }
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
