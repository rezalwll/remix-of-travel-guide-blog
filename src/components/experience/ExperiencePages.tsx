import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Compass,
  FileText,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "@/lib/router";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useFavorite } from "@/services/account";
import {
  defaultExperienceFilters,
  experienceService,
  type ExperienceSort,
} from "@/services/experienceService";
import { writeBookingDraft } from "@/store/booking";
import type { ExperienceCheckoutDraft } from "@/types/checkout";
import type {
  ExperienceFilters,
  ExperienceOffer,
  ExperienceType,
} from "@/types/experience";
import { formatPrice } from "@/utils/flight";

const labels = {
  tour: {
    title: "تورهای مسافرتی",
    empty: "توری با این شرایط پیدا نشد",
    tone: "bg-[hsl(35_35%_97%)]",
    button: "مشاهده تور",
  },
  ziyarat: {
    title: "سفرهای زیارتی",
    empty: "برنامه‌ای با این شرایط پیدا نشد",
    tone: "bg-[hsl(177_18%_97%)]",
    button: "مشاهده برنامه",
  },
};
const offerService = (type: ExperienceType) =>
  type === "tour"
    ? experienceService.getTourById
    : experienceService.getZiyaratById;

const ExperienceCard = ({ offer }: { offer: ExperienceOffer }) => (
  <article className="overflow-hidden rounded-2xl border border-border bg-card sm:grid sm:grid-cols-[240px_1fr]">
    <Link
      to={`/${offer.type === "tour" ? "tours" : "ziyarat"}/${offer.slug}`}
      className="block h-52 sm:h-full"
    >
      <img
        src={offer.images[0]}
        alt={offer.title}
        className="size-full object-cover"
      />
    </Link>
    <div className="flex flex-col p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            {offer.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-2 text-lg font-extrabold">{offer.title}</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {offer.origin} ← {offer.destinations.join("، ")} ·{" "}
            {offer.durationDays} روز و {offer.durationNights} شب
          </p>
        </div>
        <span className="rounded-lg bg-muted px-3 py-2 text-xs font-bold">
          {offer.departureOptions[0].transport}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {offer.includedServices.slice(0, 3).map((item) => (
          <span
            key={item}
            className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-end justify-between pt-5">
        <p className="text-xs text-muted-foreground">
          <CalendarDays className="me-1 inline size-3.5" />
          نزدیک‌ترین حرکت: {offer.departureOptions[0].startDate}
        </p>
        <div className="text-end">
          <p className="text-[11px] text-muted-foreground">
            شروع قیمت هر بزرگسال
          </p>
          <p className="font-extrabold text-primary">
            {formatPrice(offer.startingPrice)}
          </p>
          <Link
            to={`/${offer.type === "tour" ? "tours" : "ziyarat"}/${offer.slug}`}
            className="mt-2 inline-flex rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white"
          >
            {labels[offer.type].button}
          </Link>
        </div>
      </div>
    </div>
  </article>
);

const Filters = ({
  filters,
  onChange,
  onReset,
  type,
}: {
  filters: ExperienceFilters;
  onChange: (filters: ExperienceFilters) => void;
  onReset: () => void;
  type: ExperienceType;
}) => (
  <div className="space-y-5">
    <div className="flex justify-between">
      <h2 className="font-extrabold">فیلترها</h2>
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-bold text-primary"
      >
        پاک‌کردن
      </button>
    </div>
    <label className="block text-xs font-bold">
      مقصد
      <input
        value={filters.destination}
        onChange={(e) => onChange({ ...filters, destination: e.target.value })}
        placeholder={type === "tour" ? "مثلاً استانبول" : "مثلاً کربلا"}
        className="mt-2 min-h-10 w-full rounded-lg border border-border px-3 text-sm"
      />
    </label>
    <label className="block text-xs font-bold">
      حداکثر قیمت
      <input
        type="number"
        value={filters.maxPrice}
        onChange={(e) =>
          onChange({ ...filters, maxPrice: Number(e.target.value) })
        }
        className="mt-2 min-h-10 w-full rounded-lg border border-border px-3 text-sm"
      />
    </label>
    <label className="block text-xs font-bold">
      مدت سفر
      <select
        value={filters.maxDays}
        onChange={(e) =>
          onChange({ ...filters, maxDays: Number(e.target.value) })
        }
        className="mt-2 min-h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
      >
        <option value="30">همه</option>
        <option value="4">تا ۴ روز</option>
        <option value="7">تا ۷ روز</option>
        <option value="10">تا ۱۰ روز</option>
      </select>
    </label>
    <fieldset>
      <legend className="text-xs font-bold">نوع حرکت</legend>
      {["هوایی", "زمینی"].map((item) => (
        <label key={item} className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.transport.includes(item)}
            onChange={() =>
              onChange({
                ...filters,
                transport: filters.transport.includes(item)
                  ? filters.transport.filter((value) => value !== item)
                  : [...filters.transport, item],
              })
            }
            className="accent-primary"
          />
          {item}
        </label>
      ))}
    </fieldset>
    <fieldset>
      <legend className="text-xs font-bold">سطح اقامت</legend>
      {[5, 4, 3].map((star) => (
        <label key={star} className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.hotelStars.includes(star)}
            onChange={() =>
              onChange({
                ...filters,
                hotelStars: filters.hotelStars.includes(star)
                  ? filters.hotelStars.filter((value) => value !== star)
                  : [...filters.hotelStars, star],
              })
            }
            className="accent-primary"
          />
          {star} ستاره
        </label>
      ))}
    </fieldset>
  </div>
);

export const ExperienceListingPage = ({ type }: { type: ExperienceType }) => {
  const [query] = useSearchParams();
  const destination = query.get("destination") || "";
  const [filters, setFilters] = useState<ExperienceFilters>({
    ...defaultExperienceFilters,
    destination,
  });
  const [sort, setSort] = useState<ExperienceSort>("recommended");
  const [drawer, setDrawer] = useState(false);
  const results =
    type === "tour"
      ? experienceService.searchTours(filters, sort)
      : experienceService.searchZiyarat(filters, sort);
  useEffect(() => {
    document.title = `${labels[type].title} | کی‌آشی`;
  }, [type]);
  return (
    <Layout>
      <main className={`min-h-screen ${labels[type].tone} pb-16`}>
        <section
          className={
            type === "ziyarat" ? "bg-[hsl(177_31%_18%)] text-white" : "bg-card"
          }
        >
          <div className="container-page py-10">
            <p
              className={`text-xs font-bold ${type === "ziyarat" ? "text-[hsl(42_100%_60%)]" : "text-primary"}`}
            >
              {type === "tour" ? "کشف مقصد تازه" : "سفر با آرامش و احترام"}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">
              {labels[type].title}
            </h1>
            <p
              className={`mt-3 max-w-2xl text-sm leading-7 ${type === "ziyarat" ? "text-white/65" : "text-muted-foreground"}`}
            >
              همه قیمت‌ها، ظرفیت‌ها و برنامه‌ها نمایشی‌اند و رزرو واقعی یا تایید
              رسمی ایجاد نمی‌کنند.
            </p>
          </div>
        </section>
        <div className="container-page py-6">
          <div className="mb-4 flex items-center justify-between lg:ms-[292px]">
            <p className="text-sm font-bold">
              {results.length.toLocaleString("fa-IR")} برنامه نمونه
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold lg:hidden"
              >
                فیلترها
              </button>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3">
                <SlidersHorizontal className="size-4" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ExperienceSort)}
                  className="min-h-10 bg-transparent text-xs font-bold"
                >
                  <option value="recommended">پیشنهادی</option>
                  <option value="price">ارزان‌ترین</option>
                  <option value="date">نزدیک‌ترین تاریخ</option>
                  <option value="duration">کوتاه‌ترین مدت</option>
                  {type === "tour" && <option value="luxury">لوکس‌ترین</option>}
                </select>
              </label>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
            <aside className="hidden h-fit rounded-2xl border border-border bg-card p-5 lg:block lg:sticky lg:top-24">
              <Filters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultExperienceFilters)}
                type={type}
              />
            </aside>
            <section className="space-y-4">
              {results.length ? (
                results.map((offer) => (
                  <ExperienceCard key={offer.id} offer={offer} />
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                  <Compass className="mx-auto size-10 text-muted-foreground" />
                  <h2 className="mt-4 text-xl font-extrabold">
                    {labels[type].empty}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setFilters(defaultExperienceFilters)}
                    className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white"
                  >
                    پاک‌کردن فیلترها
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
        {drawer && (
          <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
            <button
              className="absolute inset-0"
              onClick={() => setDrawer(false)}
              aria-label="بستن"
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-5">
              <Filters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultExperienceFilters)}
                type={type}
              />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white"
              >
                نمایش نتایج
              </button>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export const ExperienceDetailPage = ({ type }: { type: ExperienceType }) => {
  const { id = "" } = useParams();
  const offer = offerService(type)(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departureId, setDepartureId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [counts, setCounts] = useState({ adults: 2, children: 0, infants: 0 });
  const favoriteState = useFavorite(!!user && !!offer, type, offer?.id ?? "");
  const favorite = favoriteState.favorite;
  if (!offer)
    return (
      <Layout>
        <main className="container-page flex min-h-[65vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold">برنامه پیدا نشد</h1>
            <Link
              to={type === "tour" ? "/tours" : "/ziyarat"}
              className="mt-4 inline-flex text-primary"
            >
              بازگشت
            </Link>
          </div>
        </main>
      </Layout>
    );
  const departure = offer.departureOptions.find(
    (item) => item.id === departureId,
  );
  const pack = offer.packages.find((item) => item.id === packageId);
  const total = pack
    ? counts.adults * pack.pricePerAdult +
      counts.children * pack.pricePerChild +
      counts.infants * (pack.pricePerInfant || 0)
    : 0;
  const book = () => {
    if (!departure || !pack || counts.adults < 1) return;
    const travelers = [
      ...Array.from({ length: counts.adults }, (_, i) => ({
        id: `adult-${i}`,
        firstName: "",
        lastName: "",
        firstNameLatin: "",
        lastNameLatin: "",
        birthDate: "",
        nationalId: "",
        passportNumber: "",
        ageCategory: "adult" as const,
      })),
      ...Array.from({ length: counts.children }, (_, i) => ({
        id: `child-${i}`,
        firstName: "",
        lastName: "",
        firstNameLatin: "",
        lastNameLatin: "",
        birthDate: "",
        nationalId: "",
        passportNumber: "",
        ageCategory: "child" as const,
      })),
      ...Array.from({ length: counts.infants }, (_, i) => ({
        id: `infant-${i}`,
        firstName: "",
        lastName: "",
        firstNameLatin: "",
        lastNameLatin: "",
        birthDate: "",
        nationalId: "",
        passportNumber: "",
        ageCategory: "infant" as const,
      })),
    ];
    const draft: ExperienceCheckoutDraft = {
      serviceType: type,
      experienceType: type,
      offer,
      departure,
      package: pack,
      travelers,
      addOns: [],
      searchUrl: `/${type === "tour" ? "tours" : "ziyarat"}/${offer.slug}`,
      searchParams: {},
      outbound: null,
      inbound: null,
      buyer: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        mobile: user?.mobile || "",
        email: user?.email || "",
      },
      passengers: [],
      ancillaries: [],
      coupon: null,
      termsAccepted: false,
    };
    writeBookingDraft(draft);
    navigate(`/checkout/${type}-travelers`);
  };
  const toggle = () => {
    if (!user)
      return navigate(
        `/auth/login?returnTo=/${type === "tour" ? "tours" : "ziyarat"}/${offer.slug}`,
      );
    favoriteState.toggle();
  };
  return (
    <Layout>
      <main className={labels[type].tone}>
        <div className="container-page py-6 pb-28">
          <div className="relative h-[360px] overflow-hidden rounded-2xl">
            <img
              src={offer.images[0]}
              alt={offer.title}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-sm text-white/70">
                {offer.origin} ← {offer.destinations.join("، ")}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold">{offer.title}</h1>
              <p className="mt-2 text-sm">
                {offer.durationDays} روز · {offer.durationNights} شب
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              aria-pressed={favorite}
              className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-white text-primary"
            >
              <Heart className={favorite ? "fill-current" : ""} />
            </button>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-xl font-extrabold">درباره برنامه</h2>
                <p className="mt-3 text-sm leading-8 text-muted-foreground">
                  {offer.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {offer.highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs text-secondary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-xl font-extrabold">انتخاب تاریخ حرکت</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {offer.departureOptions.map((item) => (
                    <label
                      key={item.id}
                      className={`cursor-pointer rounded-xl border p-4 ${departureId === item.id ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <input
                        type="radio"
                        name="departure"
                        checked={departureId === item.id}
                        onChange={() => setDepartureId(item.id)}
                        className="accent-primary"
                      />
                      <span className="ms-2 text-sm font-bold">
                        {item.startDate} تا {item.endDate}
                      </span>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.transport} · ظرفیت نمایشی {item.availableMock} نفر
                      </p>
                    </label>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-xl font-extrabold">انتخاب پکیج و هتل</h2>
                <div className="mt-4 space-y-3">
                  {offer.packages.map((item) => (
                    <label
                      key={item.id}
                      className={`grid cursor-pointer gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_auto] ${packageId === item.id ? "border-secondary bg-secondary/5" : "border-border"}`}
                    >
                      <div>
                        <input
                          type="radio"
                          name="package"
                          checked={packageId === item.id}
                          onChange={() => setPackageId(item.id)}
                          className="accent-secondary"
                        />
                        <strong className="ms-2">{item.name}</strong>
                        <p className="mt-2 text-sm">
                          {item.hotel} · {item.hotelStars} ستاره
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.roomType} · {item.mealPlan} ·{" "}
                          {item.transport || departure?.transport}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-xs text-muted-foreground">
                          هر بزرگسال
                        </p>
                        <p className="font-extrabold text-primary">
                          {formatPrice(item.pricePerAdult)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-xl font-extrabold">برنامه سفر</h2>
                <div className="mt-4 space-y-3">
                  {offer.itinerary.map((day) => (
                    <details
                      key={day.day}
                      className="rounded-xl border border-border p-4"
                    >
                      <summary className="cursor-pointer text-sm font-bold">
                        روز {day.day}: {day.title}
                      </summary>
                      <p className="mt-3 text-xs leading-6 text-muted-foreground">
                        {day.description}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="font-extrabold">خدمات شامل</h2>
                  {offer.includedServices.map((item) => (
                    <p key={item} className="mt-3 flex gap-2 text-sm">
                      <Check className="size-4 text-secondary" />
                      {item}
                    </p>
                  ))}
                </section>
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="font-extrabold">مدارک نمونه</h2>
                  {offer.documents.map((item) => (
                    <p key={item} className="mt-3 flex gap-2 text-sm">
                      <FileText className="size-4 text-primary" />
                      {item}
                    </p>
                  ))}
                  <p className="mt-4 text-xs leading-6 text-warning">
                    {offer.visaInfo}
                  </p>
                </section>
              </div>
            </div>
            <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
              <h2 className="font-extrabold">خلاصه رزرو</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["adults", "بزرگسال"],
                  ["children", "کودک"],
                  ["infants", "نوزاد"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="text-[10px] text-muted-foreground"
                  >
                    {label}
                    <input
                      type="number"
                      min={key === "adults" ? 1 : 0}
                      max="9"
                      value={counts[key as keyof typeof counts]}
                      onChange={(e) =>
                        setCounts({
                          ...counts,
                          [key]: Math.max(
                            key === "adults" ? 1 : 0,
                            Number(e.target.value),
                          ),
                        })
                      }
                      className="mt-1 min-h-10 w-full rounded-lg border border-border px-2 text-center text-sm"
                    />
                  </label>
                ))}
              </div>
              {departure && pack ? (
                <>
                  <p className="mt-4 text-sm font-bold">
                    {departure.startDate} · {pack.name}
                  </p>
                  <p className="mt-3 text-xl font-extrabold text-primary">
                    {formatPrice(total)}
                  </p>
                  <button
                    type="button"
                    onClick={book}
                    className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white"
                  >
                    ادامه رزرو
                  </button>
                </>
              ) : (
                <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  تاریخ و پکیج را انتخاب کنید.
                </p>
              )}
              <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                ظرفیت و تایید این رزرو کاملاً آزمایشی است.
              </p>
            </aside>
          </div>
        </div>
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card p-3 lg:hidden">
          <button
            type="button"
            onClick={book}
            disabled={!departure || !pack}
            className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            ادامه رزرو {total ? `· ${formatPrice(total)}` : ""}
          </button>
        </div>
      </main>
    </Layout>
  );
};
