import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RouteTransitionOverlay from "@/components/next/RouteTransitionOverlay";
import { announceRouteNavigationStart, ROUTE_NAVIGATION_START_EVENT } from "@/lib/navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ prefetch: vi.fn() }),
}));

afterEach(() => {
  vi.useRealTimers();
});

describe("route navigation feedback", () => {
  it("announces programmatic client-side navigation", () => {
    const listener = vi.fn();
    window.addEventListener(ROUTE_NAVIGATION_START_EVENT, listener);
    announceRouteNavigationStart();
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(ROUTE_NAVIGATION_START_EVENT, listener);
  });

  it("shows the airplane status only when navigation is not instant", () => {
    vi.useFakeTimers();
    render(<RouteTransitionOverlay />);
    const status = screen.getByRole("status", { hidden: true });
    expect(status).toHaveAttribute("data-route-loading", "false");

    act(() => announceRouteNavigationStart());
    act(() => vi.advanceTimersByTime(89));
    expect(status).toHaveAttribute("data-route-loading", "false");

    act(() => vi.advanceTimersByTime(1));
    expect(status).toHaveAttribute("data-route-loading", "true");
    expect(status).toHaveTextContent("در حال آماده‌کردن مسیر بعدی");
  });
});
