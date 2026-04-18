import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Get or create dentist role
    const role = await prisma.role.findUnique({
      where: { name: 'dentist' }
    });

    if (!role) {
      console.error('❌ Dentist role not found');
      return;
    }

    // Hash password correctly
    const hashedPassword = await bcrypt.hash('secret', 10);

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: 'dentist@clinic.com' },
      update: { password: hashedPassword },
      create: {
        email: 'dentist@clinic.com',
        password: hashedPassword,
        firstName: 'Dr.',
        lastName: 'García',
        roleId: role.id,
      },
    });

    console.log(`✅ User created/updated: ${user.id}`);
    console.log(`📧 Email: dentist@clinic.com`);
    console.log(`🔑 Password: secret`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
