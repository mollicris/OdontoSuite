const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, isActive: true }
    });
    console.log('Users found:', users.length);
    users.forEach(u => console.log(`  - ${u.email} (active: ${u.isActive})`));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
