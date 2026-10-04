"use client";

type Destination = {
  city: string;
  country: string;
  label: string;
  sortOrder?: number;
};
type Itinerary = {
  dayNumber: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
  transportNote?: string;
  activityNote?: string;
  sortOrder?: number;
};
type ContentKind =
  | "INCLUDED_SERVICE"
  | "EXCLUDED_SERVICE"
  | "REQUIRED_DOCUMENT"
  | "TRAVELER_NOTE"
  | "PILGRIMAGE_NOTE"
  | "ACCOMMODATION_SPLIT";
type Content = {
  kind: ContentKind;
  title: string;
  detail?: string | null;
  sortOrder?: number;
};
type Media = {
  url: string;
  altText: string;
  isCover?: boolean;
  sortOrder?: number;
};
type ProgramContent = {
  destinations: Destination[];
  itinerary: Itinerary[];
  contentItems: Content[];
  media: Media[];
  visaNote?: string | null;
  guideNote?: string | null;
  futureSalePolicy?: boolean;
};
const kindLabels: Record<ContentKind, string> = {
  INCLUDED_SERVICE: "خدمات شامل",
  EXCLUDED_SERVICE: "خدمات غیرشامل",
  REQUIRED_DOCUMENT: "مدارک لازم",
  TRAVELER_NOTE: "یادداشت مسافر",
  PILGRIMAGE_NOTE: "یادداشت زیارتی",
  ACCOMMODATION_SPLIT: "تقسیم اقامت",
};
const input = "min-h-10 w-full rounded-xl border px-3 text-sm font-normal";

function reorder<T>(rows: T[], from: number, to: number) {
  if (to < 0 || to >= rows.length) return rows;
  const copy = [...rows];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy.map((row, sortOrder) => ({ ...row, sortOrder }));
}
function RowActions({
  index,
  length,
  onMove,
  onDelete,
  onDuplicate,
}: {
  index: number;
  length: number;
  onMove: (to: number) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40"
      >
        بالاتر
      </button>
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => onMove(index + 1)}
        className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40"
      >
        پایین‌تر
      </button>
      {onDuplicate && (
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-lg border px-2 py-1 text-xs"
        >
          کپی
        </button>
      )}
      <button
        type="button"
        onClick={() => window.confirm("این ردیف حذف شود؟") && onDelete()}
        className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
      >
        حذف
      </button>
    </div>
  );
}

export default function ProgramContentEditor({
  program,
  setProgram,
  save,
  busy,
}: {
  program: ProgramContent;
  setProgram: (value: ProgramContent) => void;
  save: (body: unknown) => void;
  busy: boolean;
}) {
  const destinations = program.destinations;
  const itinerary = program.itinerary;
  const contentItems = program.contentItems;
  const media = program.media;
  const updateDestination = (index: number, patch: Partial<Destination>) =>
    setProgram({
      ...program,
      destinations: destinations.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    });
  const updateItinerary = (index: number, patch: Partial<Itinerary>) =>
    setProgram({
      ...program,
      itinerary: itinerary.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    });
  const updateContent = (index: number, patch: Partial<Content>) =>
    setProgram({
      ...program,
      contentItems: contentItems.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    });
  const updateMedia = (index: number, patch: Partial<Media>) =>
    setProgram({
      ...program,
      media: media.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    });
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black">مقصدها</h2>
            <p className="mt-1 text-xs text-slate-500">
              هر مقصد را در فیلد مستقل ثبت و مرتب کنید.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setProgram({
                ...program,
                destinations: [
                  ...destinations,
                  {
                    city: "",
                    country: "ایران",
                    label: "",
                    sortOrder: destinations.length,
                  },
                ],
              })
            }
            className="rounded-xl border px-3 py-2 text-xs font-bold"
          >
            افزودن مقصد
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {destinations.map((row, index) => (
            <article key={index} className="rounded-2xl border p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-bold">
                  شهر
                  <input
                    className={`mt-1 ${input}`}
                    value={row.city}
                    onChange={(event) =>
                      updateDestination(index, { city: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-bold">
                  کشور
                  <input
                    className={`mt-1 ${input}`}
                    value={row.country}
                    onChange={(event) =>
                      updateDestination(index, { country: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-bold">
                  عنوان نمایشی
                  <input
                    className={`mt-1 ${input}`}
                    value={row.label}
                    onChange={(event) =>
                      updateDestination(index, { label: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="mt-3">
                <RowActions
                  index={index}
                  length={destinations.length}
                  onMove={(to) =>
                    setProgram({
                      ...program,
                      destinations: reorder(destinations, index, to),
                    })
                  }
                  onDelete={() =>
                    setProgram({
                      ...program,
                      destinations: destinations
                        .filter((_, i) => i !== index)
                        .map((item, sortOrder) => ({ ...item, sortOrder })),
                    })
                  }
                />
              </div>
            </article>
          ))}
          {!destinations.length && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              هنوز مقصدی اضافه نشده است.
            </p>
          )}
        </div>
        <button
          disabled={busy}
          onClick={() => save({ destinations })}
          className="mt-4 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
        >
          ذخیره مقصدها
        </button>
      </section>
      <section className="rounded-3xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black">برنامه روزانه</h2>
            <p className="mt-1 text-xs text-slate-500">
              جزئیات هر روز به‌صورت ساختاریافته ثبت می‌شود.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setProgram({
                ...program,
                itinerary: [
                  ...itinerary,
                  {
                    dayNumber: itinerary.length + 1,
                    title: "",
                    description: "",
                    accommodation: "",
                    meals: "",
                    transportNote: "",
                    activityNote: "",
                    sortOrder: itinerary.length,
                  },
                ],
              })
            }
            className="rounded-xl border px-3 py-2 text-xs font-bold"
          >
            افزودن روز
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {itinerary.map((row, index) => (
            <article key={index} className="rounded-2xl border p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-xs font-bold">
                  روز
                  <input
                    type="number"
                    min={1}
                    className={`mt-1 ${input}`}
                    value={row.dayNumber}
                    onChange={(event) =>
                      updateItinerary(index, {
                        dayNumber: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="text-xs font-bold sm:col-span-1 lg:col-span-2">
                  عنوان
                  <input
                    className={`mt-1 ${input}`}
                    value={row.title}
                    onChange={(event) =>
                      updateItinerary(index, { title: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-bold sm:col-span-2 lg:col-span-3">
                  شرح
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-xl border p-3 font-normal"
                    value={row.description}
                    onChange={(event) =>
                      updateItinerary(index, {
                        description: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-xs font-bold">
                  اقامت
                  <input
                    className={`mt-1 ${input}`}
                    value={row.accommodation ?? ""}
                    onChange={(event) =>
                      updateItinerary(index, {
                        accommodation: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-xs font-bold">
                  وعده‌های غذایی
                  <input
                    className={`mt-1 ${input}`}
                    value={row.meals ?? ""}
                    onChange={(event) =>
                      updateItinerary(index, { meals: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-bold">
                  حمل‌ونقل
                  <input
                    className={`mt-1 ${input}`}
                    value={row.transportNote ?? ""}
                    onChange={(event) =>
                      updateItinerary(index, {
                        transportNote: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-xs font-bold sm:col-span-2 lg:col-span-3">
                  فعالیت‌ها
                  <input
                    className={`mt-1 ${input}`}
                    value={row.activityNote ?? ""}
                    onChange={(event) =>
                      updateItinerary(index, {
                        activityNote: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <div className="mt-3">
                <RowActions
                  index={index}
                  length={itinerary.length}
                  onMove={(to) =>
                    setProgram({
                      ...program,
                      itinerary: reorder(itinerary, index, to).map(
                        (item, i) => ({ ...item, dayNumber: i + 1 }),
                      ),
                    })
                  }
                  onDuplicate={() =>
                    setProgram({
                      ...program,
                      itinerary: [
                        ...itinerary.slice(0, index + 1),
                        { ...row },
                        ...itinerary.slice(index + 1),
                      ].map((item, i) => ({
                        ...item,
                        dayNumber: i + 1,
                        sortOrder: i,
                      })),
                    })
                  }
                  onDelete={() =>
                    setProgram({
                      ...program,
                      itinerary: itinerary
                        .filter((_, i) => i !== index)
                        .map((item, i) => ({
                          ...item,
                          dayNumber: i + 1,
                          sortOrder: i,
                        })),
                    })
                  }
                />
              </div>
            </article>
          ))}
        </div>
        <button
          disabled={busy}
          onClick={() => save({ itinerary })}
          className="mt-4 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
        >
          ذخیره برنامه روزانه
        </button>
      </section>
      <section className="rounded-3xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black">خدمات و مدارک</h2>
            <p className="mt-1 text-xs text-slate-500">
              نوع محتوا با عنوان فارسی انتخاب می‌شود.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setProgram({
                ...program,
                contentItems: [
                  ...contentItems,
                  {
                    kind: "INCLUDED_SERVICE",
                    title: "",
                    detail: "",
                    sortOrder: contentItems.length,
                  },
                ],
              })
            }
            className="rounded-xl border px-3 py-2 text-xs font-bold"
          >
            افزودن ردیف
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {contentItems.map((row, index) => (
            <article key={index} className="rounded-2xl border p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-bold">
                  گروه
                  <select
                    className={`mt-1 bg-white ${input}`}
                    value={row.kind}
                    onChange={(event) =>
                      updateContent(index, {
                        kind: event.target.value as ContentKind,
                      })
                    }
                  >
                    {Object.entries(kindLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold sm:col-span-2">
                  عنوان
                  <input
                    className={`mt-1 ${input}`}
                    value={row.title}
                    onChange={(event) =>
                      updateContent(index, { title: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-bold sm:col-span-3">
                  توضیح
                  <input
                    className={`mt-1 ${input}`}
                    value={row.detail ?? ""}
                    onChange={(event) =>
                      updateContent(index, { detail: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="mt-3">
                <RowActions
                  index={index}
                  length={contentItems.length}
                  onMove={(to) =>
                    setProgram({
                      ...program,
                      contentItems: reorder(contentItems, index, to),
                    })
                  }
                  onDelete={() =>
                    setProgram({
                      ...program,
                      contentItems: contentItems
                        .filter((_, i) => i !== index)
                        .map((item, sortOrder) => ({ ...item, sortOrder })),
                    })
                  }
                />
              </div>
            </article>
          ))}
        </div>
        <button
          disabled={busy}
          onClick={() => save({ contentItems })}
          className="mt-4 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
        >
          ذخیره خدمات و مدارک
        </button>
      </section>
      <section className="rounded-3xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black">تصاویر و راهنما</h2>
            <p className="mt-1 text-xs text-slate-500">
              مسیر محلی یا HTTPS، متن جایگزین و تصویر کاور را مشخص کنید.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setProgram({
                ...program,
                media: [
                  ...media,
                  {
                    url: "",
                    altText: "",
                    isCover: media.length === 0,
                    sortOrder: media.length,
                  },
                ],
              })
            }
            className="rounded-xl border px-3 py-2 text-xs font-bold"
          >
            افزودن تصویر
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {media.map((row, index) => (
            <article key={index} className="rounded-2xl border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold">
                  مسیر یا نشانی تصویر
                  <input
                    dir="ltr"
                    className={`mt-1 ${input}`}
                    value={row.url}
                    onChange={(event) =>
                      updateMedia(index, { url: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-bold">
                  متن جایگزین
                  <input
                    className={`mt-1 ${input}`}
                    value={row.altText}
                    onChange={(event) =>
                      updateMedia(index, { altText: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-bold">
                  <input
                    type="radio"
                    name="cover-media"
                    checked={Boolean(row.isCover)}
                    onChange={() =>
                      setProgram({
                        ...program,
                        media: media.map((item, i) => ({
                          ...item,
                          isCover: i === index,
                        })),
                      })
                    }
                  />
                  تصویر کاور
                </label>
                <RowActions
                  index={index}
                  length={media.length}
                  onMove={(to) =>
                    setProgram({ ...program, media: reorder(media, index, to) })
                  }
                  onDelete={() =>
                    setProgram({
                      ...program,
                      media: media
                        .filter((_, i) => i !== index)
                        .map((item, sortOrder) => ({
                          ...item,
                          sortOrder,
                          isCover:
                            item.isCover ||
                            (!media
                              .filter((_, i) => i !== index)
                              .some((entry) => entry.isCover) &&
                              sortOrder === 0),
                        })),
                    })
                  }
                />
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold">
            یادداشت راهنما
            <textarea
              className="mt-1 min-h-20 w-full rounded-xl border p-3 font-normal"
              value={program.guideNote ?? ""}
              onChange={(event) =>
                setProgram({ ...program, guideNote: event.target.value })
              }
            />
          </label>
          <label className="text-xs font-bold">
            ویزای سفر
            <textarea
              className="mt-1 min-h-20 w-full rounded-xl border p-3 font-normal"
              value={program.visaNote ?? ""}
              onChange={(event) =>
                setProgram({ ...program, visaNote: event.target.value })
              }
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs font-bold">
          <input
            type="checkbox"
            checked={program.futureSalePolicy ?? false}
            onChange={(event) =>
              setProgram({ ...program, futureSalePolicy: event.target.checked })
            }
          />
          انتشار پیش از ثبت حرکت آینده مجاز است
        </label>
        <button
          disabled={busy}
          onClick={() =>
            save({
              media,
              guideNote: program.guideNote,
              visaNote: program.visaNote,
              futureSalePolicy: program.futureSalePolicy,
            })
          }
          className="mt-4 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
        >
          ذخیره تصاویر و راهنما
        </button>
      </section>
    </div>
  );
}
