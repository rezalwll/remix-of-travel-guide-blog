import { createHash, randomUUID } from "node:crypto";

export type User = { id: string; mobile: string; firstName: string; lastName: string; createdAt: string };
export type Order = { id: string; userId?: string; trackingCode: string; serviceType: string; status: "pending_payment" | "paid" | "cancelled"; total: number; createdAt: string };
export type PaymentAttempt = { id: string; orderId: string; idempotencyKey: string; status: "pending" | "succeeded" | "failed"; amount: number; createdAt: string };
export type Refund = { id: string; orderId: string; userId: string; amount: number; reason: string; status: "requested" | "approved" | "rejected"; createdAt: string };
export type Passenger = { id: string; userId: string; firstName: string; lastName: string; nationalId?: string };
export type Favorite = { id: string; userId: string; itemType: string; itemId: string; createdAt: string };
export type SupportTicket = { id: string; userId: string; subject: string; body: string; status: "open" | "closed"; createdAt: string };
export type VisaApplication = { id: string; userId: string; country: string; status: "draft" | "submitted"; payload: Record<string, unknown>; createdAt: string };

export const hashOtp = (value: string) => createHash("sha256").update(value).digest("hex");

export class MemoryStore {
  users = new Map<string, User>();
  otpChallenges = new Map<string, { mobile: string; hash: string; expiresAt: number; attempts: number; used: boolean }>();
  sessions = new Map<string, { userId: string; expiresAt: number }>();
  orders = new Map<string, Order>();
  payments = new Map<string, PaymentAttempt>();
  refunds = new Map<string, Refund>();
  wallets = new Map<string, number>();
  passengers = new Map<string, Passenger>();
  favorites = new Map<string, Favorite>();
  notifications = new Map<string, { id: string; userId: string; title: string; body: string; read: boolean }>();
  supportTickets = new Map<string, SupportTicket>();
  visaApplications = new Map<string, VisaApplication>();

  constructor() {
    const user: User = { id: "demo-user", mobile: "09121234567", firstName: "کاربر", lastName: "نمونه", createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    this.wallets.set(user.id, 4_250_000);
  }

  findUserByMobile(mobile: string) { return [...this.users.values()].find((user) => user.mobile === mobile); }
  createUser(mobile: string) {
    const user: User = { id: randomUUID(), mobile, firstName: "", lastName: "", createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    this.wallets.set(user.id, 0);
    return user;
  }
}
