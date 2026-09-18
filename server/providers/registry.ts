import { config as defaultConfig } from "../config.js";
import { DevelopmentSmsProvider, type SmsProvider } from "./sms.js";
import { MockPaymentGateway, type PaymentGateway } from "./payment.js";
import { MockBusSupplier, MockCipSupplier, MockFlightSupplier, MockHotelSupplier, MockInsuranceSupplier, MockTrainSupplier, MockTransferSupplier, MockVisaProvider, type BusSupplier, type CipSupplier, type FlightSupplier, type HotelSupplier, type InsuranceSupplier, type TrainSupplier, type TransferSupplier, type VisaProvider } from "./travel.js";

export type ProviderConfig = Pick<typeof defaultConfig, "SMS_PROVIDER" | "PAYMENT_PROVIDER" | "FLIGHT_PROVIDER" | "HOTEL_PROVIDER" | "TRAIN_PROVIDER" | "BUS_PROVIDER" | "INSURANCE_PROVIDER" | "CIP_PROVIDER" | "TRANSFER_PROVIDER" | "VISA_PROVIDER">;
export type ProviderRegistry = { sms: SmsProvider; payment: PaymentGateway; flight: FlightSupplier; hotel: HotelSupplier; train: TrainSupplier; bus: BusSupplier; insurance: InsuranceSupplier; cip: CipSupplier; transfer: TransferSupplier; visa: VisaProvider };

export function createProviderRegistry(env: ProviderConfig = defaultConfig): ProviderRegistry {
  const unsupported = (name: string) => { throw new Error(`Provider ${name} is not configured in this build`); };
  const select = <T>(name: string, mock: T): T => name === "mock" || name === "development" ? mock : unsupported(name);
  return { sms: select(env.SMS_PROVIDER, new DevelopmentSmsProvider()), payment: select(env.PAYMENT_PROVIDER, new MockPaymentGateway()), flight: select(env.FLIGHT_PROVIDER, new MockFlightSupplier()), hotel: select(env.HOTEL_PROVIDER, new MockHotelSupplier()), train: select(env.TRAIN_PROVIDER, new MockTrainSupplier()), bus: select(env.BUS_PROVIDER, new MockBusSupplier()), insurance: select(env.INSURANCE_PROVIDER, new MockInsuranceSupplier()), cip: select(env.CIP_PROVIDER, new MockCipSupplier()), transfer: select(env.TRANSFER_PROVIDER, new MockTransferSupplier()), visa: select(env.VISA_PROVIDER, new MockVisaProvider()) };
}
