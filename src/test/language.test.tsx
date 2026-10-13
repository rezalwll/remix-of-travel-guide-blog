import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LanguageProvider from "@/components/i18n/LanguageProvider";
import LanguageToggle from "@/components/i18n/LanguageToggle";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("language switcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "fa";
    document.documentElement.dir = "rtl";
    document.documentElement.classList.remove("lang-en", "locale-ready", "locale-pending");
    document.documentElement.classList.add("lang-fa");
  });

  it("translates visible content, flips direction, and restores Persian", async () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
        <h1>سفر بعدی‌ات را همین‌جا پیدا کن</h1>
        <input aria-label="مقصد" placeholder="مقصد" />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByTestId("language-toggle"));

    await screen.findByRole("heading", { name: "Find your next journey right here" });
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("textbox", { name: "Destination" })).toHaveAttribute("placeholder", "Destination");
    expect(window.localStorage.getItem("kiashi-locale")).toBe("en");

    await waitFor(() => expect(screen.getByTestId("language-toggle")).toBeEnabled());
    fireEvent.click(screen.getByTestId("language-toggle"));

    await screen.findByRole("heading", { name: "سفر بعدی‌ات را همین‌جا پیدا کن" });
    expect(document.documentElement).toHaveAttribute("lang", "fa");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });
});
