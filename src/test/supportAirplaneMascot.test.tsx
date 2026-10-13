import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SupportAirplaneMascot, { buildFlightKeyframes } from "@/components/next/SupportAirplaneMascot";

afterEach(() => {
  vi.useRealTimers();
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
