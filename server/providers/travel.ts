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

export interface FlightSupplier extends TravelSupplier {}
export interface HotelSupplier extends TravelSupplier {}
export interface TrainSupplier extends TravelSupplier {}
export interface BusSupplier extends TravelSupplier {}
export interface InsuranceSupplier extends TravelSupplier {}
export interface CipSupplier extends TravelSupplier {}
export interface TransferSupplier extends TravelSupplier {}
export interface VisaProvider extends TravelSupplier {}

export class MockTravelSupplier implements TravelSupplier {
  private readonly reservations = new Map<string, Reservation>();
  constructor(public readonly name: string, private readonly catalog: SupplierItem[] = []) {}

  async search(query: SupplierQuery) {
    const text = Object.values(query).filter((value) => typeof value === "string").join(" ").toLowerCase();
    return this.catalog.filter((item) => !text || JSON.stringify(item).toLowerCase().includes(text));
  }
  async validate(item: SupplierItem) {
    const valid = this.catalog.some((candidate) => candidate.id === item.id);
    return valid ? { valid: true, price: typeof item.price === "number" ? item.price : undefined } : { valid: false, errors: ["ITEM_NOT_FOUND"] };
  }
  async reserve(item: SupplierItem) {
    const validation = await this.validate(item);
    if (!validation.valid) throw new ProviderError("NOT_FOUND", "Supplier item was not found", false, this.name);
    const reservation = { reservationId: randomUUID(), providerReference: `MOCK-${this.name.toUpperCase()}-${randomUUID().slice(0, 10)}`, status: "reserved" as const, item };
    this.reservations.set(reservation.reservationId, reservation);
    return reservation;
  }
  async confirm(reservation: Reservation) { return this.update(reservation, "confirmed"); }
  async cancel(reservation: Reservation) { return this.update(reservation, "cancelled"); }
  async refund(reservation: Reservation) { return this.update(reservation, "refunded"); }
  private update(reservation: Reservation, status: Reservation["status"]) {
    const current = this.reservations.get(reservation.reservationId);
    if (!current) throw new ProviderError("NOT_FOUND", "Reservation was not found", false, this.name);
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
