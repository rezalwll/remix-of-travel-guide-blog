import Link from "next/link";
import { ArrowLeft, TrainFront } from "lucide-react";
import MediaFrame from "@/components/media/MediaFrame";
import { cn } from "@/lib/utils";
import { photoLibrary } from "@/media/library";

export default function TrainComingSoonBanner({ compact = false }: { compact?: boolean }) {
  const Heading = compact ? "h2" : "h1";

  return (
    <section
      className={cn(
        "grid overflow-hidden rounded-[1.5rem] border border-[#531a16]/15 bg-[#351310] text-white",
        compact
          ? "sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          : "shadow-[0_24px_64px_-36px_#6e2925] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-start justify-center bg-gradient-to-bl from-[#722b22] to-[#351310]",
          compact ? "p-5 sm:p-7" : "p-6 sm:p-10 lg:p-14",
        )}
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ffded0] px-3 py-1.5 text-xs font-black text-[#641e17]">
          <TrainFront className="size-4" aria-hidden="true" />
          به‌زودی
        </div>
        <Heading className={cn("mt-3 font-black leading-tight", compact ? "text-2xl sm:text-3xl" : "text-4xl lg:text-6xl")}>
          بلیط قطار
        </Heading>
        <p className="mt-3 max-w-xs text-sm leading-7 text-[#ffe2da]">
          جست‌وجو و خرید بلیط قطار در کیاشی در حال آماده‌سازی است.
        </p>
        {!compact && (
          <Link
            href="/#booking"
            className="group mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#fff6f0] py-1.5 pe-1.5 ps-4 text-sm font-extrabold text-[#531a16] transition-colors hover:bg-[#ffded0] focus-visible:ring-[#ffb5a1] focus-visible:ring-offset-[#531a16]"
          >
            سایر خدمات سفر
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#7a2a23] text-white transition-colors group-hover:bg-[#531a16]" aria-hidden="true">
              <ArrowLeft className="size-4" />
            </span>
          </Link>
        )}
      </div>

      <MediaFrame
        asset={photoLibrary.vereskRailway}
        ratio="auto"
        sizes="(max-width: 767px) 100vw, 55vw"
        priority={!compact}
        imageClassName="object-[50%_36%]"
        className={compact ? "min-h-36 sm:min-h-48" : "min-h-56 sm:min-h-80 lg:min-h-[27rem]"}
      />
    </section>
  );
}
