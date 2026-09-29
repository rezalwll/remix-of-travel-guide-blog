import { seoPagePolicies, type SeoContentRecord } from "./taxonomy";

export type SeoQualityIssue = {
  code: "missing-field" | "thin-content" | "placeholder" | "missing-source" | "canonical" | "internal-links" | "duplicate-section";
  message: string;
};

export type SeoQualityResult = { pass: boolean; issues: SeoQualityIssue[] };

const placeholders = [/\blorem\b/i, /\btodo\b/i, /به[‌ ]زودی/i, /متن نمونه/i];
const volatileClaims = [/ارزان(?:‌| )ترین/i, /بهترین قیمت/i, /ظرفیت (?:قطعی|موجود)/i, /تضمین ویزا/i, /صدور قطعی/i];

const normalize = (value: string) => value
  .toLocaleLowerCase("fa")
  .replace(/[يى]/g, "ی")
  .replace(/ك/g, "ک")
  .replace(/[^\p{L}\p{N}\s]/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

export function contentSimilarity(left: string, right: string) {
  const a = new Set(normalize(left).split(" ").filter((word) => word.length > 2));
  const b = new Set(normalize(right).split(" ").filter((word) => word.length > 2));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / new Set([...a, ...b]).size;
}

export function auditSeoRecord(record: SeoContentRecord): SeoQualityResult {
  const issues: SeoQualityIssue[] = [];
  const policy = seoPagePolicies[record.pageType];
  const required = [record.path, record.title, record.description, record.h1, record.intro, record.canonical, record.updatedAt, record.reviewedAt];
  if (required.some((value) => !value.trim())) issues.push({ code: "missing-field", message: "فیلد الزامی خالی است." });
  if (record.title.length < 12 || record.description.length < 60 || record.intro.length < policy.minimumIntroLength || record.sections.length < policy.minimumSections) {
    issues.push({ code: "thin-content", message: "عنوان، توضیح، مقدمه یا تعداد بخش‌ها کمتر از حد سیاست این نوع صفحه است." });
  }
  const allText = [record.title, record.description, record.h1, record.intro, ...record.sections].join(" ");
  if ([...placeholders, ...volatileClaims].some((pattern) => pattern.test(allText))) issues.push({ code: "placeholder", message: "متن نمایشی یا ادعای تجاری اثبات‌نشده شناسایی شد." });
  if ((policy.sourceRequired || record.volatility === "high") && !record.sources.some((source) => source.official)) issues.push({ code: "missing-source", message: "صفحهٔ حساس یا پرنوسان به منبع رسمی نیاز دارد." });
  if (record.canonical !== record.path || !record.path.startsWith("/")) issues.push({ code: "canonical", message: "canonical باید مسیر مطلق داخلی و برابر مسیر اصلی باشد." });
  if (record.indexable && record.internalLinks.length < 2) issues.push({ code: "internal-links", message: "صفحهٔ ایندکس‌پذیر حداقل به دو مسیر مرتبط نیاز دارد." });
  if (new Set(record.sections.map(normalize)).size !== record.sections.length) issues.push({ code: "duplicate-section", message: "بخش تکراری در یک صفحه وجود دارد." });
  if (record.sitemap && !record.indexable) issues.push({ code: "canonical", message: "صفحهٔ noindex نباید در سایت‌مپ باشد." });
  return { pass: issues.length === 0, issues };
}

export function findNearDuplicates(records: SeoContentRecord[], threshold = 0.82) {
  const duplicates: { left: string; right: string; similarity: number }[] = [];
  for (let left = 0; left < records.length; left += 1) {
    for (let right = left + 1; right < records.length; right += 1) {
      const similarity = contentSimilarity(
        [records[left].intro, ...records[left].sections].join(" "),
        [records[right].intro, ...records[right].sections].join(" "),
      );
      if (similarity >= threshold) duplicates.push({ left: records[left].path, right: records[right].path, similarity });
    }
  }
  return duplicates;
}

export const indexableSeoRecords = (records: SeoContentRecord[]) => records.filter((record) => record.indexable && record.sitemap && auditSeoRecord(record).pass);
