import { config as defaultConfig } from "../config.js";
import { DevelopmentSmsProvider, type SmsProvider } from "./sms.js";
import { MockPaymentGateway, type PaymentGateway } from "./payment.js";
import { MockBusSupplier, MockCipSupplier, MockFlightSupplier, MockHotelSupplier, MockInsuranceSupplier, MockTrainSupplier, MockTransferSupplier, MockVisaProvider, type BusSupplier, type CipSupplier, type FlightSupplier, type HotelSupplier, type InsuranceSupplier, type TrainSupplier, type TransferSupplier, type VisaProvider } from "./travel.js";
import { mockFlights } from "../../src/data/flights.js";
import { hotels } from "../../src/data/hotels.js";
import { trains, buses, insurancePlans, cipPackages, transferVehicles } from "../../src/data/secondary.js";
import type { SupplierItem } from "./travel.js";

export type ProviderConfig = Pick<typeof defaultConfig, "NODE_ENV" | "WEB_ORIGIN" | "MOCK_PAYMENT_SECRET" | "SMS_PROVIDER" | "PAYMENT_PROVIDER" | "FLIGHT_PROVIDER" | "HOTEL_PROVIDER" | "TRAIN_PROVIDER" | "BUS_PROVIDER" | "INSURANCE_PROVIDER" | "CIP_PROVIDER" | "TRANSFER_PROVIDER" | "VISA_PROVIDER">;
export type ProviderRegistry = { sms: SmsProvider; payment: PaymentGateway; flight: FlightSupplier; hotel: HotelSupplier; train: TrainSupplier; bus: BusSupplier; insurance: InsuranceSupplier; cip: CipSupplier; transfer: TransferSupplier; visa: VisaProvider };

export function createProviderRegistry(env: ProviderConfig = defaultConfig): ProviderRegistry {
  const unsupported = (name: string) => { throw new Error(`Provider ${name} is not configured in this build`); };
  const select = <T>(name: string, expected: string, mock: T): T => name === expected ? mock : unsupported(name);
  const items = <T extends { id: string }>(kind: string, catalog: T[]): SupplierItem[] => [{ id: `${kind}-demo` }, ...catalog.map((entry) => ({ ...entry }))];
  const flightItems = [...items("flight", mockFlights), { id: "flight-phase16-failure", price: 8_900_000, mockBookingOutcome: "failed" }, { id: "flight-phase16-unknown", price: 8_900_000, mockBookingOutcome: "unknown" }];
  const hotelItems = [...items("hotel", hotels), { id: "hotel-phase16-failure", price: 5_500_000, mockBookingOutcome: "failed" }];
  if (env.NODE_ENV === "production" && env.PAYMENT_PROVIDER === "mock" && !env.MOCK_PAYMENT_SECRET) throw new Error("MOCK_PAYMENT_SECRET is required for production mock callbacks");
  return { sms: select(env.SMS_PROVIDER, "development", new DevelopmentSmsProvider()), payment: select(env.PAYMENT_PROVIDER, "mock", new MockPaymentGateway(env.MOCK_PAYMENT_SECRET, env.WEB_ORIGIN)), flight: select(env.FLIGHT_PROVIDER, "mock", new MockFlightSupplier(flightItems)), hotel: select(env.HOTEL_PROVIDER, "mock", new MockHotelSupplier(hotelItems)), train: select(env.TRAIN_PROVIDER, "mock", new MockTrainSupplier(items("train", trains))), bus: select(env.BUS_PROVIDER, "mock", new MockBusSupplier(items("bus", buses))), insurance: select(env.INSURANCE_PROVIDER, "mock", new MockInsuranceSupplier(items("insurance", insurancePlans))), cip: select(env.CIP_PROVIDER, "mock", new MockCipSupplier(items("cip", cipPackages))), transfer: select(env.TRANSFER_PROVIDER, "mock", new MockTransferSupplier(items("transfer", transferVehicles))), visa: select(env.VISA_PROVIDER, "mock", new MockVisaProvider([{ id: "visa-demo" }])) };
}
