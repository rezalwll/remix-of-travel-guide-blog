import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SupportAirplaneMascot from "@/components/next/SupportAirplaneMascot";

afterEach(() => {
  vi.useRealTimers();
});

describe("support airplane mascot", () => {
  it("flies on first render and greets the visitor after landing", () => {
    vi.useFakeTimers();
    render(<SupportAirplaneMascot />);

    expect(document.querySelector('[data-support-mascot="flying"]')).toBeInTheDocument();
    expect(screen.queryByText("سلام، من پشتیبان کیاشی هستم 👋")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5_400));

    expect(document.querySelector('[data-support-mascot="landed"]')).toBeInTheDocument();
    expect(screen.getByText("سلام، من پشتیبان کیاشی هستم 👋")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "گفتگو با پشتیبانی" })).toHaveAttribute("href", "/support");
  });

  it("lets the visitor close and reopen the greeting", () => {
    vi.useFakeTimers();
    render(<SupportAirplaneMascot />);
    act(() => vi.advanceTimersByTime(5_400));

    fireEvent.click(screen.getByRole("button", { name: "بستن پیام پشتیبان" }));
    expect(screen.queryByText("سلام، من پشتیبان کیاشی هستم 👋")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "بازکردن پیام پشتیبان کیاشی" }));
    expect(screen.getByText("سلام، من پشتیبان کیاشی هستم 👋")).toBeInTheDocument();
  });
});
