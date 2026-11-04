import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SupportAirplaneMascot, { buildFlightKeyframes } from "@/components/next/SupportAirplaneMascot";
import { AuthContext, type AuthContextValue } from "@/context/AuthContext";
import { backend, type ApiTracking } from "@/services/backend";

const guestAuth: AuthContextValue = {
  session: null,
  user: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
};

const renderMascot = (auth = guestAuth) => render(
  <AuthContext.Provider value={auth}>
    <SupportAirplaneMascot />
  </AuthContext.Provider>,
);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("support airplane mascot", () => {
  it("keeps movement and rotation continuous across the full flight path", () => {
    const frames = buildFlightKeyframes(1_280, 720);
    const positions = frames.map(({ transform }) => {
      const match = transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
      expect(match).not.toBeNull();
      return { x: Number(match?.[1]), y: Number(match?.[2]) };
    });
    const distances = positions.slice(1).map((point, index) => (
      Math.hypot(point.x - positions[index].x, point.y - positions[index].y)
    ));
    const rotations = frames.map(({ transform }) => {
      const match = transform.match(/rotate\(([-\d.]+)deg\)/);
      expect(match).not.toBeNull();
      return Number(match?.[1]);
    });
    const rotationChanges = rotations.slice(1).map((rotation, index) => Math.abs(rotation - rotations[index]));

    expect(Math.max(...distances) / Math.min(...distances)).toBeLessThan(1.08);
    expect(Math.max(...rotationChanges)).toBeLessThan(1);
    expect(rotations.at(-1)).toBeCloseTo(0, 5);
  });

  it("flies on first render and greets the visitor after landing", () => {
    vi.useFakeTimers();
    renderMascot();

    expect(document.querySelector('[data-support-mascot="flying"]')).toBeInTheDocument();
    expect(screen.queryByText("سلام، من پشتیبان کیاشی هستم 👋")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5_400));

    expect(document.querySelector('[data-support-mascot="landed"]')).toBeInTheDocument();
    expect(screen.getByText("سلام، من پشتیبان کیاشی هستم 👋")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "شروع گفتگو" })).toBeInTheDocument();
  });

  it("opens the full assistant from the airplane after dismissing the greeting", () => {
    vi.useFakeTimers();
    renderMascot();
    act(() => vi.advanceTimersByTime(5_400));

    fireEvent.click(screen.getByRole("button", { name: "بستن پیام پشتیبان" }));
    expect(screen.queryByText("سلام، من پشتیبان کیاشی هستم 👋")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "بازکردن دستیار پشتیبانی کیاشی" }));
    expect(screen.getByRole("dialog", { name: "پشتیبان کیاشی" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "پیگیری سفارش وضعیت لحظه‌ای خرید" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ثبت درخواست ارتباط با پشتیبان" })).toBeInTheDocument();
  });

  it("offers inline order tracking and sends guests to a persistent support account", () => {
    vi.useFakeTimers();
    renderMascot();
    act(() => vi.advanceTimersByTime(5_400));
    fireEvent.click(screen.getByRole("button", { name: "شروع گفتگو" }));

    fireEvent.click(screen.getByRole("button", { name: "پیگیری سفارش وضعیت لحظه‌ای خرید" }));
    fireEvent.change(screen.getByLabelText("شناسه سفارش"), { target: { value: "KIA-1" } });
    fireEvent.change(screen.getByLabelText("موبایل خریدار"), { target: { value: "0912" } });
    fireEvent.click(screen.getByRole("button", { name: "بررسی وضعیت سفارش" }));
    expect(screen.getByRole("alert")).toHaveTextContent("شماره موبایل ۱۱ رقمی");

    fireEvent.click(screen.getByRole("button", { name: "بازگشت به صفحه اصلی پشتیبانی" }));
    fireEvent.click(screen.getByRole("button", { name: "ثبت درخواست ارتباط با پشتیبان" }));
    expect(screen.getByRole("link", { name: "ورود با شماره موبایل" })).toHaveAttribute("href", "/auth/login?returnTo=%2Faccount%2Fsupport");
  });

  it("shows a real tracking response inside the assistant", async () => {
    const tracking: ApiTracking = {
      orderNumber: "KIA-2026-000001",
      trackingCode: "TRK-1",
      serviceType: "flight",
      summary: {},
      relevantDate: null,
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      total: 8_900_000,
      currency: "TOMAN",
      createdAt: new Date().toISOString(),
      buyerMobile: "0912••••567",
    };
    vi.spyOn(backend, "track").mockResolvedValue({ tracking });
    vi.useFakeTimers();
    renderMascot();
    act(() => vi.advanceTimersByTime(5_400));
    vi.useRealTimers();
    fireEvent.click(screen.getByRole("button", { name: "شروع گفتگو" }));
    fireEvent.click(screen.getByRole("button", { name: "پیگیری سفارش وضعیت لحظه‌ای خرید" }));
    fireEvent.change(screen.getByLabelText("شناسه سفارش"), { target: { value: "KIA-2026-000001" } });
    fireEvent.change(screen.getByLabelText("موبایل خریدار"), { target: { value: "09121234567" } });
    fireEvent.click(screen.getByRole("button", { name: "بررسی وضعیت سفارش" }));

    expect(await screen.findByText("سفارش KIA-2026-000001")).toBeInTheDocument();
    expect(screen.getByText("پرداخت موفق")).toBeInTheDocument();
    expect(backend.track).toHaveBeenCalledWith("KIA-2026-000001", "09121234567");
  });

  it("creates a persistent support ticket for an authenticated customer", async () => {
    const user = { id: "user-1", firstName: "آرمان", lastName: "نمونه", mobile: "09121234567", email: "demo@example.test", createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    const authenticated: AuthContextValue = { ...guestAuth, user, session: { user, authenticatedAt: "2026-01-01" } };
    vi.spyOn(backend, "createSupport").mockResolvedValue({
      ticket: { id: "ticket-1", subject: "[پرداخت] بررسی کسر وجه", status: "open", createdAt: "2026-01-01", updatedAt: "2026-01-01", messages: [] },
    });
    vi.useFakeTimers();
    renderMascot(authenticated);
    act(() => vi.advanceTimersByTime(5_400));
    vi.useRealTimers();
    fireEvent.click(screen.getByRole("button", { name: "شروع گفتگو" }));
    fireEvent.click(screen.getByRole("button", { name: "ثبت درخواست ارتباط با پشتیبان" }));
    fireEvent.change(screen.getByLabelText("موضوع درخواست"), { target: { value: "پرداخت" } });
    fireEvent.change(screen.getByLabelText("عنوان کوتاه"), { target: { value: "بررسی کسر وجه" } });
    fireEvent.change(screen.getByLabelText(/شرح درخواست/), { target: { value: "مبلغ کسر شده اما سفارش تأیید نشده است." } });
    fireEvent.click(screen.getByRole("button", { name: "ثبت درخواست پشتیبانی" }));

    expect(await screen.findByText("درخواستت با موفقیت ثبت شد")).toBeInTheDocument();
    expect(backend.createSupport).toHaveBeenCalledWith("[پرداخت] بررسی کسر وجه", "مبلغ کسر شده اما سفارش تأیید نشده است.");
  });

  it("preserves the current step across close and reopen and supports Escape", () => {
    vi.useFakeTimers();
    renderMascot();
    act(() => vi.advanceTimersByTime(5_400));
    fireEvent.click(screen.getByRole("button", { name: "شروع گفتگو" }));
    fireEvent.click(screen.getByRole("button", { name: "مشکل پرداخت کسر وجه و تراکنش" }));
    expect(screen.getByRole("dialog", { name: "مشکل پرداخت" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "بستن دستیار پشتیبانی" }));
    act(() => vi.advanceTimersByTime(1));
    fireEvent.click(screen.getByRole("button", { name: "بازکردن دستیار پشتیبانی کیاشی" }));
    expect(screen.getByRole("dialog", { name: "مشکل پرداخت" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
