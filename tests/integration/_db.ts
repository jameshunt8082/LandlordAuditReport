import { readFileSync } from "node:fs";
import { createClient } from "@vercel/postgres";

/** Load .env.local into process.env without overwriting already-set vars. */
export function loadEnv(): void {
  const env = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  if (!process.env.POSTGRES_URL && process.env.POSTGRES_URL_NON_POOLING) {
    process.env.POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING;
  }
}

/** Open a fresh, independent connection (each gets its own Postgres session).
 * Uses the non-pooling URL: createClient requires a direct connection, and advisory
 * locks need a stable session anyway. */
export async function newClient() {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  const client = createClient({ connectionString });
  await client.connect();
  return client;
}

export function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error("assertion failed: " + message);
  console.log("  ✓", message);
}
