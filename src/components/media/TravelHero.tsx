import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { MediaAsset } from "@/media/library";
import MediaFrame from "@/components/media/MediaFrame";

export type TravelHeroProps = {
  asset: MediaAsset;
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  badges?: string[];
  size?: "page" | "landing" | "compact";
  /** Rendered under the copy, e.g. a booking widget that should visually attach to the hero. */
  children?: React.ReactNode;
  align?: "start" | "center";
  bright?: boolean;
  brandWash?: boolean;
  relaxedCopy?: boolean;
  /** Adds room at the bottom so an overlapping search widget can sit across the hero edge. */
  overlapBottom?: boolean;
};

const sizes = {
  page: "min-h-[30rem] sm:min-h-[38rem]",
  landing: "min-h-[24rem] sm:min-h-[30rem]",
  compact: "min-h-[17rem] sm:min-h-[21rem]",
} as const;

/**
 * Cinematic page opener. The media sits behind real text (never baked into pixels),
 * so headings stay crawlable, translatable and accessible.
 */
export default function TravelHero({
  asset,
  eyebrow,
  title,
  description,
  primary,
  secondary,
  badges,
  size = "landing",
  children,
  align = "start",
  bright = false,
  brandWash = false,
  relaxedCopy = false,
  overlapBottom = false,
}: TravelHeroProps) {
  return (
    <section className="relative isolate overflow-hidden text-white">
      <div className="absolute inset-0 -z-10">
        <MediaFrame
          asset={asset}
          ratio="21/9"
          sizes="100vw"
          priority
          overlay={bright ? "sideLight" : "side"}
          decorative
          className={`size-full ${sizes[size]}`}
          imageClassName={bright ? "object-cover brightness-110" : "object-cover"}
        />
        {brandWash && (
          <div
            className="absolute inset-0 bg-[linear-gradient(270deg,rgb(231_63_30/0.96)_0%,rgb(251_108_0/0.9)_52%,rgb(249_182_55/0.72)_100%)]"
            aria-hidden="true"
          />
        )}
      </div>
      <div className={`container-page flex ${sizes[size]} flex-col justify-center py-12 sm:py-16 ${overlapBottom ? "pb-32 sm:pb-36" : ""}`}>
        <div className={`flex flex-col ${relaxedCopy ? "gap-7" : "gap-5"} ${align === "center" ? "mx-auto max-w-3xl items-center text-center" : "max-w-2xl items-start"}`}>
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-extrabold backdrop-blur">
              {eyebrow}
            </span>
          )}
          <h1 className={`text-[2.1rem] font-black drop-shadow-sm sm:text-5xl lg:text-[3.6rem] ${relaxedCopy ? "leading-[1.4]" : "leading-[1.25]"}`}>{title}</h1>
          {description && <p className="max-w-xl text-sm leading-8 text-white/82 sm:text-base">{description}</p>}
          {badges && badges.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <li key={badge} className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold backdrop-blur">{badge}</li>
              ))}
            </ul>
          )}
          {(primary || secondary) && (
            <div className="flex flex-wrap gap-3">
              {primary && (
                <Link href={primary.href} className="primary-cta bg-white text-foreground hover:bg-white/90">
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link href={secondary.href} className="secondary-cta border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                  {secondary.label} <ArrowLeft className="size-4" />
                </Link>
              )}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
