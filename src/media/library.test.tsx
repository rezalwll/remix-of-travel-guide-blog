import { existsSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MediaFrame from "@/components/media/MediaFrame";
import { destinationAsset, mediaRegistry, photoLibrary } from "@/media/library";

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

  it("exposes content alt text and hides decorative photographs", () => {
    const { rerender } = render(<MediaFrame asset={photoLibrary.books} />);
    expect(screen.getByRole("img", { name: photoLibrary.books.alt })).toBeInTheDocument();
    rerender(<MediaFrame asset={photoLibrary.books} decorative />);
    expect(screen.getByRole("presentation")).toHaveAttribute("alt", "");
  });
});
