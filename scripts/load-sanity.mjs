const base = process.env.API_URL || "http://127.0.0.1:8787";
const path = process.env.LOAD_PATH || "/health/live";
const count = Math.min(Number(process.env.LOAD_COUNT || 25), 200);
const heapBefore = process.memoryUsage().heapUsed;
const runStarted = performance.now();
const samples = await Promise.all(Array.from({ length: count }, async () => {
  const started = performance.now();
  const response = await fetch(`${base}${path}`);
  return { status: response.status, duration: performance.now() - started };
}));
const durations = samples.map((item) => item.duration).sort((a, b) => a - b);
const percentile = (value) => durations[Math.min(durations.length - 1, Math.floor(durations.length * value))];
const failures = samples.filter((item) => item.status >= 500).length;
const elapsedMs = performance.now() - runStarted;
console.log(JSON.stringify({ base, path, count, failures, errorRate: failures / count, requestsPerSecond: Math.round((count / elapsedMs) * 100_000) / 100, p50Ms: Math.round(percentile(0.5) * 100) / 100, p95Ms: Math.round(percentile(0.95) * 100) / 100, p99Ms: Math.round(percentile(0.99) * 100) / 100, heapDeltaBytes: process.memoryUsage().heapUsed - heapBefore }));
if (failures) process.exit(1);
