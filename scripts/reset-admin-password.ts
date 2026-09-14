/**
 * scripts/reset-admin-password.ts
 *
 * ONE-TIME USE: directly updates the existing SUPER_ADMIN account's password
 * in the live database. This is necessary because prisma/seed.ts's `upsert`
 * uses `update: {}` — running the seed again does NOT change an already-
 * existing admin's password. This script is the only way to actually
 * rotate the password that was previously hardcoded and exposed on GitHub
 * as "Admin@123456!".
 *
 * Usage:
 *   1. Make sure your local .env has the PRODUCTION DATABASE_URL (the same
 *      one Vercel uses) — not a local dev database.
 *   2. Set NEW_ADMIN_PASSWORD in your .env (a strong password you choose).
 *   3. Run:  npx tsx scripts/reset-admin-password.ts
 *   4. Delete NEW_ADMIN_PASSWORD from .env afterwards, and delete this
 *      script's usage from your shell history if it's visible there.
 *
 * After running, log in at /admin with the email below and the new
 * password. The old "Admin@123456!" password will no longer work.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@erg.com.np";
  const newPassword = process.env.NEW_ADMIN_PASSWORD;

  if (!newPassword) {
    throw new Error(
      "Set NEW_ADMIN_PASSWORD in your .env before running this script."
    );
  }
  if (newPassword.length < 12) {
    throw new Error("Choose a password of at least 12 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    throw new Error(`No user found with email ${email}. Nothing to reset.`);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log(`✅ Password updated for ${email}.`);
  console.log("The old 'Admin@123456!' password no longer works.");
  console.log("Now delete NEW_ADMIN_PASSWORD from your .env file.");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
