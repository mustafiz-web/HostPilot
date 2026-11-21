const bcrypt = require('../backend/node_modules/bcryptjs');
const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  const result = await prisma.user.updateMany({
    where: { email: { in: ['admin@hostpilot.dev', 'admin@hostpilot.com'] } },
    data: { role: 'ADMIN', status: 'ACTIVE', passwordHash: hash }
  });
  console.log('Updated users count:', result.count);
  await prisma.$disconnect();
}
run().catch(console.error);
