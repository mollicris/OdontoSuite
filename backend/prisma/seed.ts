import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default roles
  const patientRole = await prisma.role.upsert({
    where: { name: 'patient' },
    update: {},
    create: {
      name: 'patient',
      description: 'Patient role',
      permissions: ['read:own-appointments', 'read:own-medical-history'],
    },
  });

  const dentistRole = await prisma.role.upsert({
    where: { name: 'dentist' },
    update: {},
    create: {
      name: 'dentist',
      description: 'Dentist role',
      permissions: [
        'read:patients',
        'write:appointments',
        'write:treatments',
        'read:invoices',
      ],
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role',
      permissions: ['*:*'],
    },
  });

  console.log('✅ Roles created:');
  console.log(`  - Patient: ${patientRole.id}`);
  console.log(`  - Dentist: ${dentistRole.id}`);
  console.log(`  - Admin: ${adminRole.id}`);

  // Create test clinic
  const clinic = await prisma.clinic.upsert({
    where: { email: 'test@clinic.com' },
    update: {},
    create: {
      name: 'Test Dental Clinic',
      email: 'test@clinic.com',
      phone: '+591 1234567890',
      address: '123 Main St',
      city: 'La Paz',
      state: 'La Paz',
      zipCode: '00000',
      country: 'Bolivia',
    },
  });
  console.log(`✅ Clinic created: ${clinic.id}`);

  // Create test dentist user
  const dentist = await prisma.user.upsert({
    where: { email: 'dentist@clinic.com' },
    update: {},
    create: {
      email: 'dentist@clinic.com',
      password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', // password 'secret'
      firstName: 'Dr.',
      lastName: 'García',
      roleId: dentistRole.id,
    },
  });
  console.log(`✅ Dentist user created: ${dentist.id}`);

  // Create dentist profile
  await prisma.dentistProfile.upsert({
    where: { userId: dentist.id },
    update: {},
    create: {
      userId: dentist.id,
      licenseName: 'License',
      licenseNumber: 'LIC12345',
      licenseExpiry: new Date('2030-12-31'),
      specialization: 'General',
      yearsOfExperience: 5,
    },
  });
  console.log(`✅ Dentist profile created`);

  // Create test patient
  const patient = await prisma.patient.upsert({
    where: { cpf: 'TEST12345678' },
    update: {},
    create: {
      clinicId: clinic.id,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'patient@test.com',
      phone: '+591 9876543210',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'M',
      cpf: 'TEST12345678',
    },
  });
  console.log(`✅ Patient created: ${patient.id}`);

  // Create test service
  let service = await prisma.service.findFirst({
    where: {
      clinicId: clinic.id,
      name: 'Limpieza',
    },
  });

  if (!service) {
    service = await prisma.service.create({
      data: {
        clinicId: clinic.id,
        name: 'Limpieza',
        description: 'Dental cleaning',
        duration: 30,
        price: 150,
      },
    });
  }
  console.log(`✅ Service created/found: ${service.id}`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nTest credentials:');
  console.log(`  Email: dentist@clinic.com`);
  console.log(`  Password: secret`);
  console.log('\nTest IDs:');
  console.log(`  Clinic: ${clinic.id}`);
  console.log(`  Dentist: ${dentist.id}`);
  console.log(`  Patient: ${patient.id}`);
  console.log(`  Service: ${service.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
