import { existsSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MediaRail, PromoBanner, RailItem } from "@/components/media/Cards";
import MediaFrame from "@/components/media/MediaFrame";
import { destinationAsset, mediaRegistry, photoLibrary, serviceAsset } from "@/media/library";

describe("travel media registry", () => {
  it("keeps every registered photograph local and present", () => {
    for (const asset of Object.values(photoLibrary)) {
      expect(asset.src.startsWith("/"), asset.id).toBe(true);
      expect(existsSync(join(process.cwd(), "public", asset.src.slice(1))), asset.src).toBe(true);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
    }
  });

  it("gives every informative asset a Persian-friendly alt label", () => {
    for (const group of Object.values(mediaRegistry)) {
      for (const asset of Object.values(group)) {
        expect(asset.alt.trim().length, asset.id).toBeGreaterThan(4);
      }
    }
  });

  it("uses real photographs for every visible media category", () => {
    for (const [name, group] of Object.entries(mediaRegistry)) {
      for (const asset of Object.values(group)) {
        expect(asset.kind, `${name}/${asset.id}`).toBe("photo");
      }
    }
  });

  it("returns a deterministic real-photo fallback for unknown destinations", () => {
    expect(destinationAsset("missing-city")).toEqual(destinationAsset("missing-city"));
    expect(destinationAsset("missing-city").kind).toBe("photo");
  });

  it("maps core destinations and pilgrimage surfaces to relevant local photographs", () => {
    expect(destinationAsset("mashhad")).toMatchObject({ src: "/media/destinations/mashhad.webp" });
    expect(destinationAsset("istanbul")).toMatchObject({ src: "/media/destinations/istanbul.webp" });
    expect(destinationAsset("dubai")).toMatchObject({ src: "/media/destinations/dubai.webp" });
    expect(destinationAsset("najaf")).toMatchObject({ src: "/media/destinations/najaf.webp" });
    expect(destinationAsset("karbala")).toMatchObject({ src: "/media/ziyarat/karbala-hero.webp" });
    expect(destinationAsset("najaf-karbala")).toMatchObject({ src: "/media/ziyarat/karbala-hero.webp" });
  });

  it("uses the current travel-planning photograph for support surfaces", () => {
    expect(serviceAsset("support")).toMatchObject({ src: "/media/phone.webp" });
    expect(serviceAsset("support")).not.toMatchObject({ src: "/media/support.webp" });
  });

  it("exposes content alt text and hides decorative photographs", () => {
    const { rerender } = render(<MediaFrame asset={photoLibrary.books} />);
    expect(screen.getByRole("img", { name: photoLibrary.books.alt })).toBeInTheDocument();
    rerender(<MediaFrame asset={photoLibrary.books} decorative />);
    expect(screen.getByRole("presentation")).toHaveAttribute("alt", "");
  });

  it("keeps centered promo content inside the mobile card width", () => {
    render(
      <PromoBanner
        href="/support"
        asset={photoLibrary.books}
        title="دربارهٔ شرایط اقامت سؤال داری؟"
        description="پاسخ پرسش‌های متداول اقامت"
        align="center"
      />,
    );

    const heading = screen.getByRole("heading", { name: "دربارهٔ شرایط اقامت سؤال داری؟" });
    const mediaFrame = heading.parentElement?.parentElement;
    expect(mediaFrame).toHaveClass("aspect-auto", "w-full", "sm:aspect-[21/9]");
    expect(heading.parentElement).toHaveClass("items-center", "text-center", "min-w-0");
    expect(heading).toHaveClass("max-w-xl", "text-center");
  });

  it("provides working controls for horizontally scrollable media rails", () => {
    render(
      <MediaRail label="مقصدهای پیشنهادی">
        <RailItem>مشهد</RailItem>
        <RailItem>کربلا</RailItem>
      </MediaRail>,
    );

    const rail = screen.getByRole("list", { name: "مقصدهای پیشنهادی" });
    const scrollBy = vi.fn();
    Object.defineProperties(rail, {
      clientWidth: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 1200 },
      scrollLeft: { configurable: true, writable: true, value: 0 },
      scrollBy: { configurable: true, value: scrollBy },
    });
    fireEvent.scroll(rail);

    const nextButton = screen.getByRole("button", { name: "موارد بعدی" });
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });
});
