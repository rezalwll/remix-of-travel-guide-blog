import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { MediaAsset } from "@/media/library";
import MediaFrame, { type MediaFrameProps } from "@/components/media/MediaFrame";

type Ratio = MediaFrameProps["ratio"];

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  tone?: "default" | "invert";
}) {
  const muted = tone === "invert" ? "text-white/72" : "text-muted-foreground";
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        {eyebrow && <p className={`text-xs font-extrabold ${tone === "invert" ? "text-accent" : "text-primary"}`}>{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{title}</h2>
        {description && <p className={`mt-3 text-sm leading-7 ${muted}`}>{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className={`inline-flex items-center gap-1 text-sm font-bold ${tone === "invert" ? "text-white hover:text-accent" : "text-secondary hover:text-primary"}`}>
          {action.label} <ArrowLeft className="size-4" />
        </Link>
      )}
    </div>
  );
}

/**
 * Horizontal scroll rail. Pure CSS scroll-snap: keyboard reachable, swipeable,
 * RTL-correct and fully crawlable because every card stays in the DOM.
 */
export function MediaRail({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="scrollbar-none -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {children}
    </ul>
  );
}

export function RailItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <li className={`w-[78vw] shrink-0 snap-start sm:w-[46%] lg:w-[31%] ${className}`}>{children}</li>;
}

function Badge({ children, tone = "demo" }: { children: React.ReactNode; tone?: "demo" | "accent" | "muted" }) {
  const tones = {
    demo: "bg-foreground/72 text-white backdrop-blur",
    accent: "bg-accent text-accent-foreground",
    muted: "bg-white/88 text-foreground backdrop-blur",
  } as const;
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.7rem] font-extrabold ${tones[tone]}`}>{children}</span>;
}

export { Badge as MediaBadge };

/** Image-first card with the title rendered over the media. Used for destinations and collections. */
export function OverlayCard({
  href,
  asset,
  title,
  subtitle,
  badge,
  ratio = "4/5",
  sizes,
  priority,
  className = "",
}: {
  href: string;
  asset: MediaAsset;
  title: string;
  subtitle?: string;
  badge?: string;
  ratio?: Ratio;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`group block overflow-hidden rounded-[1.25rem] border border-border/70 shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)] ${className}`}>
      <MediaFrame asset={asset} ratio={ratio} sizes={sizes} priority={priority} overlay="strong" zoom decorative>
        {badge && <div className="absolute end-3 top-3 z-10">{<Badge>{badge}</Badge>}</div>}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white sm:p-5">
          <h3 className="text-lg font-black drop-shadow-sm sm:text-xl">{title}</h3>
          {subtitle && <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-white/80 sm:text-sm">{subtitle}</p>}
        </div>
      </MediaFrame>
    </Link>
  );
}

/** Photo on top, content below. Used for stays, tours and services. */
export function ImageCard({
  href,
  asset,
  title,
  description,
  meta,
  chips,
  badge,
  cta = "مشاهده",
  ratio = "3/2",
  sizes,
  priority,
}: {
  href: string;
  asset: MediaAsset;
  title: string;
  description?: string;
  meta?: string;
  chips?: string[];
  badge?: string;
  cta?: string;
  ratio?: Ratio;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/70 bg-card shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[var(--shadow-card)]">
      <MediaFrame asset={asset} ratio={ratio} sizes={sizes} priority={priority} zoom decorative overlay="soft">
        {badge && <div className="absolute start-3 top-3 z-10">{<Badge>{badge}</Badge>}</div>}
        {meta && <div className="absolute bottom-3 end-3 z-10">{<Badge tone="muted">{meta}</Badge>}</div>}
      </MediaFrame>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-extrabold group-hover:text-primary sm:text-lg">{title}</h3>
        {description && <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{description}</p>}
        {chips && chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li key={chip} className="soft-chip">{chip}</li>
            ))}
          </ul>
        )}
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-secondary">
          {cta} <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none" />
        </span>
      </div>
    </Link>
  );
}

/** Editorial card for magazine surfaces. `featured` renders the large lead story. */
export function EditorialCard({
  href,
  asset,
  title,
  description,
  category,
  date,
  featured = false,
  sizes,
  priority,
}: {
  href: string;
  asset: MediaAsset;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  featured?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  if (featured) {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-[1.5rem] border border-border/70 shadow-[var(--shadow-card)]">
        <MediaFrame asset={asset} ratio="16/9" sizes={sizes ?? "(max-width: 1024px) 100vw, 60vw"} priority={priority} overlay="strong" zoom decorative className="min-h-[19rem]">
          <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              {category && <Badge tone="accent">{category}</Badge>}
              {date && <time className="text-xs font-bold text-white/75">{date}</time>}
            </div>
            <h3 className="mt-3 max-w-2xl text-2xl font-black leading-snug sm:text-3xl">{title}</h3>
            {description && <p className="mt-3 max-w-xl line-clamp-2 text-sm leading-7 text-white/80">{description}</p>}
          </div>
        </MediaFrame>
      </Link>
    );
  }
  return (
    <Link href={href} className="group flex h-full gap-4 rounded-2xl border border-border/70 bg-card p-3 transition duration-300 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-[var(--shadow-card)]">
      <MediaFrame asset={asset} ratio="1/1" sizes="120px" zoom decorative className="w-24 shrink-0 rounded-xl sm:w-28" />
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {category && <p className="text-[0.7rem] font-extrabold text-primary">{category}</p>}
        <h3 className="mt-1 line-clamp-2 text-sm font-extrabold leading-6 group-hover:text-primary sm:text-base">{title}</h3>
        {date && <time className="mt-2 text-xs text-muted-foreground">{date}</time>}
      </div>
    </Link>
  );
}

/** Compact service entry: icon + branded media, used in the service discovery grid. */
export function ServiceTile({
  href,
  asset,
  label,
  hint,
  icon: Icon,
}: {
  href: string;
  asset: MediaAsset;
  label: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[var(--shadow-card)]">
      <MediaFrame asset={asset} ratio="16/9" sizes="(max-width: 768px) 45vw, 18vw" zoom decorative overlay="soft" />
      <div className="flex items-center gap-2.5 p-3.5">
        {Icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
            <Icon className="size-4.5" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-extrabold group-hover:text-primary">{label}</span>
          {hint && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{hint}</span>}
        </span>
      </div>
    </Link>
  );
}

/** Route card with split origin/destination media — replaces the old text-only route tiles. */
export function RouteCard({
  href,
  originAsset,
  destinationAsset,
  origin,
  destination,
  note,
  badge,
}: {
  href: string;
  originAsset: MediaAsset;
  destinationAsset: MediaAsset;
  origin: string;
  destination: string;
  note?: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/70 bg-card shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[var(--shadow-card)]">
      <div className="relative grid grid-cols-2 gap-0.5">
        <MediaFrame asset={originAsset} ratio="4/3" sizes="(max-width: 768px) 40vw, 18vw" zoom decorative overlay="soft" />
        <MediaFrame asset={destinationAsset} ratio="4/3" sizes="(max-width: 768px) 40vw, 18vw" zoom decorative overlay="soft" />
        <span className="absolute left-1/2 top-1/2 z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-primary shadow-lg">
          <ArrowLeft className="size-5" />
        </span>
        {badge && <span className="absolute start-3 top-3 z-10">{<Badge>{badge}</Badge>}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-extrabold group-hover:text-primary sm:text-lg">
          {origin} <span className="text-muted-foreground">→</span> {destination}
        </h3>
        {note && <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{note}</p>}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-secondary">راهنمای مسیر <ArrowLeft className="size-4" /></span>
      </div>
    </Link>
  );
}

/** Full-width campaign banner. Editorial by design: it never claims a live price. */
export function PromoBanner({
  href,
  asset,
  eyebrow,
  title,
  description,
  cta = "مشاهده",
  align = "start",
  priority,
}: {
  href: string;
  asset: MediaAsset;
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: string;
  align?: "start" | "center";
  priority?: boolean;
}) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-[1.5rem] border border-border/60 shadow-[var(--shadow-card)]">
      <MediaFrame asset={asset} ratio="21/9" sizes="(max-width: 1024px) 100vw, 1200px" overlay="side" zoom decorative priority={priority} className="min-h-[15rem]">
        <div className={`absolute inset-0 z-10 flex flex-col justify-center gap-3 p-6 text-white sm:p-12 ${align === "center" ? "items-center text-center" : "items-start max-w-xl"}`}>
          {eyebrow && <Badge tone="accent">{eyebrow}</Badge>}
          <h3 className="text-2xl font-black leading-tight sm:text-4xl">{title}</h3>
          {description && <p className="text-sm leading-7 text-white/82 sm:text-base">{description}</p>}
          <span className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
            {cta} <ArrowLeft className="size-4" />
          </span>
        </div>
      </MediaFrame>
    </Link>
  );
}

/** Small round category entry used by the visual category strip. */
export function CategoryBubble({ href, asset, label }: { href: string; asset: MediaAsset; label: string }) {
  return (
    <Link href={href} className="group flex w-24 shrink-0 flex-col items-center gap-2 sm:w-28">
      <MediaFrame asset={asset} ratio="1/1" sizes="112px" zoom decorative className="w-full rounded-full border-2 border-transparent transition group-hover:border-secondary/50" />
      <span className="text-center text-xs font-extrabold group-hover:text-primary">{label}</span>
    </Link>
  );
}
