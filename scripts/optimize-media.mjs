#!/usr/bin/env node
// Convert locally owned raster assets to browser-friendly WebP derivatives.
// Existing WebP files are deliberately left alone so repeated runs do not
// introduce generational quality loss.
import { readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const roots = [path.join(root, "src", "assets"), path.join(root, "public")];
const sourcePattern = /\.(?:jpe?g|png)$/i;
const preservedFiles = new Set(["favicon-kiashi.png"]);
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function walk(directory) {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(absolute) : absolute;
    }),
  );
  return files.flat();
}

async function convert(source) {
  const parsed = path.parse(source);
  const output = path.join(parsed.dir, `${parsed.name}.webp`);
  const isLogo = parsed.base === "kiashi-logo.webp";
  const before = (await stat(source)).size;

  let pipeline = sharp(source).rotate();
  pipeline = isLogo
    ? pipeline.resize({ width: 512, withoutEnlargement: true })
    : pipeline.resize({ width: 1920, height: 1800, fit: "inside", withoutEnlargement: true });

  const buffer = await pipeline
    .webp({ quality: isLogo ? 88 : 76, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toBuffer();

  const previous = existsSync(output) ? (await stat(output)).size : Number.POSITIVE_INFINITY;
  if (buffer.length >= previous) {
    return { source, output, before, after: previous, skipped: true };
  }

  await writeFile(output, buffer);
  return { source, output, before, after: buffer.length, skipped: false };
}

async function main() {
  const sourceFiles = (await Promise.all(roots.map(walk)))
    .flat()
    .filter((file) => sourcePattern.test(file) && !preservedFiles.has(path.basename(file)))
    .sort();

  let saved = 0;
  let converted = 0;
  for (const source of sourceFiles) {
    const result = await convert(source);
    const relativeSource = path.relative(root, result.source);
    const relativeOutput = path.relative(root, result.output);
    if (result.skipped) {
      console.log(`keep    ${relativeOutput} (existing file is already smaller)`);
      continue;
    }
    converted += 1;
    saved += result.before - result.after;
    console.log(`convert ${relativeSource} ${kb(result.before)} -> ${relativeOutput} ${kb(result.after)}`);
  }

  console.log(`\nconverted ${converted} files; derivative savings ${kb(saved)}`);
  console.log("Original source files are retained until references and builds are verified.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
