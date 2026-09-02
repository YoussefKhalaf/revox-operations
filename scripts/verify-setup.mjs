/**
 * Verify REVOX Operations Supabase setup without printing secrets.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_NAME = "REVOX Operations";
const ENV_FILE = join(ROOT, ".env.local");

function envStatus() {
  if (!existsSync(ENV_FILE)) return { url: "missing", key: "missing" };
  const content = readFileSync(ENV_FILE, "utf8");
  const url = content.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1]?.trim();
  const key = content.match(/^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.+)$/m)?.[1]?.trim();
  return {
    url: url ? "configured" : "missing",
    key: key ? "configured" : "missing",
  };
}

function runSupabase(args) {
  return execFileSync("npx", ["supabase", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function main() {
  const report = { env: envStatus(), cliAuthenticated: false, projectFound: false, projectName: PROJECT_NAME, region: null };

  try {
    const projects = JSON.parse(runSupabase(["projects", "list", "-o", "json"]));
    report.cliAuthenticated = true;
    const project = projects.find((entry) => entry.name === PROJECT_NAME);
    if (project) {
      report.projectFound = true;
      report.region = project.region ?? null;
    }
  } catch {
    report.cliAuthenticated = false;
  }

  console.log(JSON.stringify(report, null, 2));
}

main();
