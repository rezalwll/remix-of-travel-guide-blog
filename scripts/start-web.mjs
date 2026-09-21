import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const readArg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};

const standalone = resolve(".next/standalone");
if (!existsSync(resolve(standalone, "server.js"))) {
  console.error("Next standalone build is missing; run npm run build:web first.");
  process.exit(1);
}

cpSync(resolve("public"), resolve(standalone, "public"), { recursive: true });
cpSync(resolve(".next/static"), resolve(standalone, ".next/static"), { recursive: true });

const child = spawn(process.execPath, [resolve(standalone, "server.js")], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: readArg("--port", process.env.PORT || "3000"),
    HOSTNAME: readArg("--hostname", process.env.HOSTNAME || "0.0.0.0"),
  },
});

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code, signal) => process.exitCode = signal ? 1 : (code ?? 1));
