import Image from "next/image";
import type { MediaAsset } from "@/media/library";
import TravelScene from "@/components/media/TravelScene";

const ratios = {
  "21/9": "aspect-[21/9]",
  "16/9": "aspect-[16/9]",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
} as const;

const overlays = {
  none: "",
  soft: "bg-[linear-gradient(to_top,hsl(213_35%_10%/0.72),hsl(213_35%_10%/0.12)_52%,transparent)]",
  strong: "bg-[linear-gradient(to_top,hsl(213_35%_8%/0.88),hsl(213_35%_8%/0.45)_55%,hsl(213_35%_8%/0.22))]",
  side: "bg-[linear-gradient(270deg,hsl(213_35%_9%/0.14),hsl(213_35%_9%/0.55)_48%,hsl(213_35%_9%/0.86))]",
} as const;

export type MediaFrameProps = {
  asset: MediaAsset;
  ratio?: keyof typeof ratios;
  sizes?: string;
  priority?: boolean;
  overlay?: keyof typeof overlays;
  className?: string;
  imageClassName?: string;
  /** Decorative media gets an empty alt so screen readers skip it. */
  decorative?: boolean;
  zoom?: boolean;
  children?: React.ReactNode;
};

/**
 * Single entry point for every visual surface. Photography goes through next/image,
 * branded scenes render as inline SVG, and both share identical framing and overlay.
 */
export default function MediaFrame({
  asset,
  ratio = "4/3",
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  priority = false,
  overlay = "none",
  className = "",
  imageClassName = "",
  decorative = false,
  children,
}: MediaFrameProps) {
  return (
    <div className={`relative isolate overflow-hidden bg-muted ${ratios[ratio]} ${className}`}>
      {asset.kind === "photo" ? (
        <Image
          src={asset.src}
          alt={decorative ? "" : asset.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={`object-cover ${imageClassName}`}
        />
      ) : (
        <TravelScene
          scene={asset.scene}
          palette={asset.palette}
          label={decorative ? undefined : asset.alt}
          className={`absolute inset-0 size-full ${imageClassName}`}
        />
      )}
      {overlay !== "none" && <div className={`absolute inset-0 ${overlays[overlay]}`} aria-hidden="true" />}
      {children}
    </div>
  );
}

export { ratios as mediaRatios };
