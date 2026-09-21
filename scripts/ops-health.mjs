const base = process.env.API_URL || "http://127.0.0.1:8787";
for (const path of ["/health/live", "/health/ready", "/health/version", "/api/health/providers"]) {
  const response = await fetch(`${base}${path}`);
  console.log(`${path} ${response.status} ${await response.text()}`);
  if (!response.ok && path !== "/api/health/providers") process.exitCode = 1;
}
