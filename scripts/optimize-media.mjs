#!/usr/bin/env node
// Converts oversized demo photography into web-ready WebP derivatives.
// Source assets stay project-owned; no external downloads happen here.
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const assetsDir = path.join(root, "src", "assets");
const publicDir = path.join(root, "public");

/** @type {{ file: string; width: number; quality: number; targets: string[] }[]} */
const jobs = [
  { file: "hero-kish-premium.png", width: 1920, quality: 76, targets: ["assets", "public"] },
  { file: "hotel-tehran-premium.png", width: 1600, quality: 76, targets: ["assets", "public"] },
  { file: "hotel-istanbul-premium.png", width: 1600, quality: 76, targets: ["assets", "public"] },
  { file: "world-map.jpg", width: 1600, quality: 72, targets: ["public"] },
];

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;

async function convert({ file, width, quality, targets }) {
  const source = path.join(assetsDir, file);
  if (!existsSync(source)) {
    const fallback = path.join(publicDir, file);
    if (!existsSync(fallback)) return { file, skipped: true };
    return convertFrom(fallback, file, width, quality, targets);
  }
  return convertFrom(source, file, width, quality, targets);
}

async function convertFrom(source, file, width, quality, targets) {
  const before = (await stat(source)).size;
  const output = `${path.parse(file).name}.webp`;
  const buffer = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer();
  for (const target of targets) {
    const dir = target === "assets" ? assetsDir : publicDir;
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, output), buffer);
  }
  return { file, output, before, after: buffer.length, skipped: false };
}

async function main() {
  const results = [];
  for (const job of jobs) results.push(await convert(job));
  let saved = 0;
  for (const result of results) {
    if (result.skipped) {
      console.log(`skip    ${result.file} (source missing)`);
      continue;
    }
    saved += result.before - result.after;
    console.log(`convert ${result.file} ${kb(result.before)} -> ${result.output} ${kb(result.after)}`);
  }
  console.log(`total saved ${kb(saved)}`);

  const remaining = [];
  for (const dir of [assetsDir, publicDir]) {
    if (!existsSync(dir)) continue;
    for (const entry of await readdir(dir)) {
      if (!/\.(png|jpe?g|webp)$/i.test(entry)) continue;
      const size = (await stat(path.join(dir, entry))).size;
      if (size > 700 * 1024) remaining.push(`${path.relative(root, path.join(dir, entry))} ${kb(size)}`);
    }
  }
  if (remaining.length) {
    console.log("\noversized assets still present:");
    for (const entry of remaining) console.log(`  ${entry}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
