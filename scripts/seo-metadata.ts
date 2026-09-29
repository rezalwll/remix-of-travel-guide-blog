import { seoContentInventory } from "../src/seo/inventory";
import { auditSeoRecord, findNearDuplicates } from "../src/seo/quality";

const failures: string[] = [];
const duplicateField = (label: string, values: { path: string; value: string }[]) => {
  const groups = new Map<string, string[]>();
  for (const item of values) groups.set(item.value.trim().toLocaleLowerCase("fa"), [...(groups.get(item.value.trim().toLocaleLowerCase("fa")) ?? []), item.path]);
  for (const paths of groups.values()) if (paths.length > 1) failures.push(`${label} تکراری: ${paths.join(", ")}`);
};

for (const record of seoContentInventory) {
  const result = auditSeoRecord(record);
  if (record.indexable && !result.pass) failures.push(`${record.path}: ${result.issues.map((issue) => issue.message).join(" | ")}`);
}

duplicateField("title", seoContentInventory.map((record) => ({ path: record.path, value: record.title })));
duplicateField("description", seoContentInventory.map((record) => ({ path: record.path, value: record.description })));
duplicateField("H1", seoContentInventory.map((record) => ({ path: record.path, value: record.h1 })));

for (const pair of findNearDuplicates(seoContentInventory)) failures.push(`شباهت بیش از حد ${(pair.similarity * 100).toFixed(0)}٪: ${pair.left} ↔ ${pair.right}`);

if (failures.length) {
  console.error(`SEO metadata/content gate failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

const countByType = seoContentInventory.reduce<Record<string, number>>((counts, record) => ({ ...counts, [record.pageType]: (counts[record.pageType] ?? 0) + 1 }), {});
const counts = Object.entries(countByType).map(([type, count]) => `${type}=${count}`);
console.log(`SEO metadata/content gate passed (${seoContentInventory.length} records; ${counts.join(", ")}).`);
