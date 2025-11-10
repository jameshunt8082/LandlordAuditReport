import { config } from "dotenv";
import { sql } from "@vercel/postgres";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function runMigration() {
  try {
    console.log("Starting database migration...");
    console.log("Note: Make sure POSTGRES_URL is set in your .env.local file\n");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Remove comments and split by statements
    const statements = schema
      .split("\n")
      .filter((line) => !line.trim().startsWith("--") && line.trim().length > 0)
      .join("\n")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\s+/g, " ");
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
      
      try {
        await sql.query(statement);
        console.log(`  ✓ Success\n`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message && error.message.includes("already exists")) {
          console.log(`  ⚠ Already exists (skipped)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log("✓ Database migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();

