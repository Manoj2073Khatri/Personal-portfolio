import { config } from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

config({ path: '.env.local', quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const hashed = await bcrypt.hash('adminpass', 10);
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashed,
      role: Role.ADMIN,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
