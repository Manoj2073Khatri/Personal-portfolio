/**
 * Creates or updates the CMS admin account. This is the only way to create
 * an admin: there is deliberately no registration endpoint.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long passphrase' npm run admin:create
 *
 * Re-running with the same email resets that account's password and signs
 * out its existing session.
 */
import { config } from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

config({ path: '.env.local', quiet: true });

const MIN_PASSWORD_LENGTH = 12;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || null;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error('Set ADMIN_EMAIL to a valid email address');
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Set ADMIN_PASSWORD to at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hash,
        role: Role.ADMIN,
        refreshToken: null,
        ...(name ? { name } : {}),
      },
      create: { email, password: hash, role: Role.ADMIN, name },
    });
    console.log(`Admin ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});
