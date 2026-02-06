import { config } from "dotenv";
import { sql } from "@vercel/postgres";

// Load environment variables from .env.local
config({ path: ".env.local" });

/**
 * Migration: Add role column to users table for RBAC
 * 
 * This adds a 'role' column with default 'auditor'. Existing users
 * will be set to 'auditor' role. Admin users need to be manually
 * promoted via SQL: UPDATE users SET role = 'admin' WHERE email = '...';
 */
async function migrate() {
  try {
    console.log("🔄 Adding role column to users table...\n");

    // Add role column if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'auditor' NOT NULL
    `;
    console.log("✅ Added 'role' column with default 'auditor'\n");

    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `;

    if (result.rows.length > 0) {
      console.log("✅ Column verified:", result.rows[0]);
    }

    console.log("\n🎉 Migration complete!");
    console.log("\n📝 To promote a user to admin, run:");
    console.log("   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';");
    
    process.exit(0);
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("⚠️  Column already exists (skipped)");
      process.exit(0);
    }
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
