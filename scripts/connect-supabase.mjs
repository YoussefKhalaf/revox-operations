/**
 * Connect REVOX Operations to a live Supabase project.
 * Authenticates via an authenticated Supabase CLI session or a local
 * gitignored token file at `.supabase-access.local` (never commit this file).
 * Never prints secrets to stdout.
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_NAME = "REVOX Operations";
const TOKEN_FILE = join(ROOT, ".supabase-access.local");
const MIGRATION_FILE = join(ROOT, "supabase", "migrations", "001_initial_schema.sql");
const ENV_FILE = join(ROOT, ".env.local");

function getAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  if (existsSync(TOKEN_FILE)) {
    const token = readFileSync(TOKEN_FILE, "utf8").trim();
    if (token) return token;
  }
  return null;
}

function runSupabase(args, token) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  return execFileSync(command, ["supabase", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
    env: {
      ...process.env,
      ...(token ? { SUPABASE_ACCESS_TOKEN: token } : {}),
    },
  }).trim();
}

function dbQuery(projectRef, sql, token) {
  const env = {
    ...process.env,
    ...(token ? { SUPABASE_ACCESS_TOKEN: token } : {}),
  };
  const command = `npx supabase db query --linked --project-ref ${projectRef} ${JSON.stringify(sql)}`;
  return execSync(command, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env,
  }).trim();
}

function runSupabaseJson(args, token) {
  return JSON.parse(runSupabase([...args, "-o", "json"], token));
}

function writeEnvLocal(url, publishableKey) {
  writeFileSync(
    ENV_FILE,
    [`NEXT_PUBLIC_SUPABASE_URL=${url}`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`, ""].join("\n"),
    "utf8",
  );
}

function verifyEnvLocal() {
  if (!existsSync(ENV_FILE)) return { url: "missing", key: "missing" };
  const content = readFileSync(ENV_FILE, "utf8");
  const url = content.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1]?.trim();
  const key = content.match(/^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.+)$/m)?.[1]?.trim();
  return {
    url: url ? "configured" : "missing",
    key: key ? "configured" : "missing",
  };
}

function pickPublishableKey(keys) {
  const list = Array.isArray(keys) ? keys : keys?.api_keys ?? [];
  const selected =
    list.find((entry) => {
      const name = String(entry.name ?? entry.type ?? "").toLowerCase();
      return name.includes("anon") || name.includes("publishable");
    }) ??
    list.find((entry) => !String(entry.name ?? entry.type ?? "").toLowerCase().includes("service"));

  const value = selected?.api_key ?? selected?.key;
  if (!value) {
    throw new Error("Could not locate the public publishable key for the project.");
  }
  return value;
}

function schemaAlreadyApplied(projectRef, token) {
  const result = dbQuery(
    projectRef,
    "select count(*) as table_count from information_schema.tables where table_schema = 'public' and table_name = 'profiles';",
    token,
  );
  return /\|\s*1\s*\|/.test(result) || result.includes("1");
}

function applyMigration(projectRef, token) {
  runSupabase(["db", "query", "--linked", "--project-ref", projectRef, "--file", MIGRATION_FILE], token);
}

function verifyRemoteSchema(projectRef, token) {
  const tables = [
    "profiles",
    "operation_members",
    "apartments",
    "revenues",
    "cash_advances",
    "expenses",
    "advance_returns",
  ];
  const views = [
    "apartment_financial_summary",
    "cash_advance_balance_details",
    "operation_member_advance_summary",
  ];

  return {
    tables: dbQuery(
      projectRef,
      `select table_name from information_schema.tables where table_schema = 'public' and table_name in (${tables.map((t) => `'${t}'`).join(", ")}) order by table_name;`,
      token,
    ),
    views: dbQuery(
      projectRef,
      `select table_name from information_schema.views where table_schema = 'public' and table_name in (${views.map((v) => `'${v}'`).join(", ")}) order by table_name;`,
      token,
    ),
    rls: dbQuery(
      projectRef,
      `select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relname in (${tables.map((t) => `'${t}'`).join(", ")}) order by c.relname;`,
      token,
    ),
    anonPolicies: dbQuery(
      projectRef,
      "select tablename, policyname from pg_policies where schemaname = 'public' and 'anon' = any(roles);",
      token,
    ),
    authTrigger: dbQuery(projectRef, "select tgname from pg_trigger where tgname = 'on_auth_user_created';", token),
    expenseTrigger: dbQuery(
      projectRef,
      "select tgname from pg_trigger where tgname = 'validate_expense_cash_advance';",
      token,
    ),
    amountChecks: dbQuery(
      projectRef,
      "select conrelid::regclass::text as table_name, conname from pg_constraint where contype = 'c' and pg_get_constraintdef(oid) ilike '%amount > 0%';",
      token,
    ),
    securityInvoker: dbQuery(
      projectRef,
      `select c.relname, c.reloptions from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'v' and c.relname in (${views.map((v) => `'${v}'`).join(", ")}) order by c.relname;`,
      token,
    ),
    sampleData: dbQuery(
      projectRef,
      "select 'revenues' as table_name, count(*) from public.revenues union all select 'expenses', count(*) from public.expenses union all select 'cash_advances', count(*) from public.cash_advances;",
      token,
    ),
  };
}

function getAdminStatus(projectRef, token) {
  const result = dbQuery(
    projectRef,
    "select count(*) as admin_count from public.profiles where role = 'admin' and is_active = true;",
    token,
  );
  return /\|\s*[1-9]/.test(result) ? "admin-present" : "admin-missing";
}

function main() {
  const token = getAccessToken();

  let projects;
  try {
    projects = runSupabaseJson(["projects", "list"], token);
  } catch {
    console.log("STATUS: auth-required");
    process.exit(1);
  }

  const project = projects.find((entry) => entry.name === PROJECT_NAME);
  if (!project) {
    console.log("STATUS: project-not-found");
    process.exit(1);
  }

  const projectRef = project.id;
  const keys = runSupabaseJson(["projects", "api-keys", "--project-ref", projectRef], token);
  writeEnvLocal(`https://${projectRef}.supabase.co`, pickPublishableKey(keys));

  const migrationStatus = schemaAlreadyApplied(projectRef, token) ? "already-applied-skipped" : "applied";
  if (migrationStatus === "applied") {
    applyMigration(projectRef, token);
  }

  console.log(
    "STATUS: complete",
    JSON.stringify(
      {
        projectAction: "reused-existing",
        projectName: project.name,
        region: project.region,
        env: verifyEnvLocal(),
        migration: migrationStatus,
        admin: getAdminStatus(projectRef, token),
        verification: verifyRemoteSchema(projectRef, token),
      },
      null,
      2,
    ),
  );
}

main();
