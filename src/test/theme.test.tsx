import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ThemeToggle from "@/components/theme/ThemeToggle";

const { setTheme } = vi.hoisted(() => ({ setTheme: vi.fn() }));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme }),
}));

describe("theme switcher", () => {
  it("exposes an accessible control and switches to dark mode", () => {
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button", { name: "فعال‌کردن حالت تیره" });
    expect(toggle).toBeEnabled();

    fireEvent.click(toggle);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
