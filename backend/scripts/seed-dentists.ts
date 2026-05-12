import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando dentistas de prueba...\n');

  // Crear rol de dentista si no existe
  let dentistRole = await prisma.role.findUnique({
    where: { name: 'dentist' },
  });

  if (!dentistRole) {
    dentistRole = await prisma.role.create({
      data: {
        name: 'dentist',
        description: 'Dentista',
        permissions: ['appointments:read', 'appointments:create', 'treatments:create'],
      },
    });
    console.log('✅ Rol de dentista creado');
  }

  // Dentistas de prueba
  const dentistsData = [
    {
      email: 'dra.maria@clinic.com',
      firstName: 'María',
      lastName: 'García',
      phone: '5551234567',
      password: 'Password123!',
      specialization: 'Limpieza Dental',
    },
    {
      email: 'dr.juan@clinic.com',
      firstName: 'Juan',
      lastName: 'López',
      phone: '5559876543',
      password: 'Password123!',
      specialization: 'Odontología General',
    },
    {
      email: 'dra.ana@clinic.com',
      firstName: 'Ana',
      lastName: 'Rodríguez',
      phone: '5552345678',
      password: 'Password123!',
      specialization: 'Ortodoncia',
    },
    {
      email: 'dr.carlos@clinic.com',
      firstName: 'Carlos',
      lastName: 'Martínez',
      phone: '5553456789',
      password: 'Password123!',
      specialization: 'Endodoncia',
    },
  ];

  for (const data of dentistsData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log(`⏭️  ${data.firstName} ${data.lastName} ya existe`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: hashedPassword,
        roleId: dentistRole.id,
        emailVerified: true,
        isActive: true,
      },
    });

    await prisma.dentistProfile.create({
      data: {
        userId: user.id,
        licenseName: `Licencia ${data.firstName}`,
        licenseNumber: `LIC-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        specialization: data.specialization,
        isAvailable: true,
      },
    });

    console.log(`✅ ${data.firstName} ${data.lastName} (${data.specialization})`);
  }

  console.log('\n✅ Dentistas de prueba creados correctamente');
  console.log('\n📌 Ahora ejecuta:');
  console.log('   npx ts-node scripts/link-dentists-to-clinic.ts');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
