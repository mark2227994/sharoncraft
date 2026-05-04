#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const isWindows = process.platform === "win32";
const args = process.argv.slice(2);
const isProd = args.includes("--prod");

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

function read(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    shell: false,
  });

  if (result.error || result.status !== 0) {
    return "";
  }

  return String(result.stdout || "").trim();
}

const gitCommand = isWindows ? "cmd" : "git";
const gitArgs = isWindows ? ["/c", "git", "branch", "--show-current"] : ["branch", "--show-current"];
const branch = read(gitCommand, gitArgs);

if (isProd) {
  console.log("[deploy] Starting a PRODUCTION deploy (--prod).");
  console.log(
    "[deploy] This targets Vercel Production (the deployment that becomes or replaces 'Current' for your production domain)."
  );
  if (branch && branch !== "main") {
    console.log(
      `[deploy] Branch is "${branch}" (not main). --prod still publishes to this project's Production; ensure that matches your intent.`
    );
  }
} else {
  console.log("[deploy] Starting a PREVIEW deploy (no --prod).");
  console.log(
    "[deploy] IMPORTANT: Preview does NOT update Production 'Current' or your custom domain. Use npm run deploy:prod, push the production branch, or Promote in Vercel to ship live."
  );
}

const vercelCommand = isWindows ? "cmd" : "vercel";
const vercelArgs = isWindows
  ? ["/c", "vercel", "deploy", "--yes"]
  : ["deploy", "--yes"];

if (isProd) {
  vercelArgs.push("--prod");
}

run(vercelCommand, vercelArgs);
