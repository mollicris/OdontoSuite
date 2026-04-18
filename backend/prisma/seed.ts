import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({ log: ['error'] });

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing test users
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@odontosuites.com', 'secretaria@odontosuites.com', 'paciente@odontosuites.com'],
      },
    },
  });
  console.log('✅ Cleaned up existing test users');

  // Generate password hash for test users
  const passwordHash = await bcrypt.hash('secret', 10);

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

  const secretaryRole = await prisma.role.upsert({
    where: { name: 'secretary' },
    update: {},
    create: {
      name: 'secretary',
      description: 'Secretary role',
      permissions: [
        'read:appointments',
        'write:appointments',
        'read:patients',
        'read:invoices',
        'write:invoices',
      ],
    },
  });

  console.log('✅ Roles created:');
  console.log(`  - Patient: ${patientRole.id}`);
  console.log(`  - Dentist: ${dentistRole.id}`);
  console.log(`  - Secretary: ${secretaryRole.id}`);
  console.log(`  - Admin: ${adminRole.id}`);

  // Create test clinic with specific ID for appointments demo
  const clinic = await prisma.clinic.upsert({
    where: { id: 'f48805c5-e12b-4774-9465-6b29c880d005' },
    update: {},
    create: {
      id: 'f48805c5-e12b-4774-9465-6b29c880d005',
      name: 'Clínica Dental OdontoSuite',
      email: 'info@odontosuites.com',
      phone: '+591 2-3456789',
      address: 'Calle Principal 123',
      city: 'Santa Cruz',
      state: 'SC',
      zipCode: '00000',
      country: 'Bolivia',
      description: 'Clínica dental de referencia',
    },
  });
  console.log(`✅ Clinic created: ${clinic.id}`);

  // Create test dentist user with specific ID for appointments demo
  const dentist = await prisma.user.upsert({
    where: { id: '64b97af4-bdfa-49d4-8a41-f0b7e5e127cc' },
    update: {},
    create: {
      id: '64b97af4-bdfa-49d4-8a41-f0b7e5e127cc',
      email: 'doctor.garcia@odontosuites.com',
      password: passwordHash,
      firstName: 'David',
      lastName: 'García',
      phone: '+591 76123456',
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

  // Create test patient with specific ID for appointments demo
  const patient = await prisma.patient.upsert({
    where: { id: '3db4b080-83ef-4b10-a2c8-b81b1a26d6bb' },
    update: {},
    create: {
      id: '3db4b080-83ef-4b10-a2c8-b81b1a26d6bb',
      clinicId: clinic.id,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '+591 70123456',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'M',
      cpf: 'CPF-JUAN-001',
    },
  });
  console.log(`✅ Patient created: ${patient.id}`);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@odontosuites.com' },
    update: {},
    create: {
      email: 'admin@odontosuites.com',
      password: passwordHash,
      firstName: 'Administrador',
      lastName: 'Sistema',
      phone: '+591 76000000',
      roleId: adminRole.id,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.id}`);

  // Create secretary user
  const secretaryUser = await prisma.user.upsert({
    where: { email: 'secretaria@odontosuites.com' },
    update: {},
    create: {
      email: 'secretaria@odontosuites.com',
      password: passwordHash,
      firstName: 'María',
      lastName: 'López',
      phone: '+591 76111111',
      roleId: secretaryRole.id,
    },
  });
  console.log(`✅ Secretary user created: ${secretaryUser.id}`);

  // Create patient user
  const patientUser = await prisma.user.upsert({
    where: { email: 'paciente@odontosuites.com' },
    update: {},
    create: {
      email: 'paciente@odontosuites.com',
      password: passwordHash,
      firstName: 'Carlos',
      lastName: 'Martínez',
      phone: '+591 76222222',
      roleId: patientRole.id,
    },
  });
  console.log(`✅ Patient user created: ${patientUser.id}`);

  // Create test services with specific ID for appointments demo
  const service = await prisma.service.upsert({
    where: { id: '3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d' },
    update: {},
    create: {
      id: '3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d',
      clinicId: clinic.id,
      name: 'Limpieza Dental',
      description: 'Limpieza profesional de dientes y eliminación de sarro',
      duration: 30,
      price: 150,
    },
  });
  console.log(`✅ Service created: ${service.id}`);

  // Create additional services
  await prisma.service.upsert({
    where: { id: 'service-treatment-001' },
    update: {},
    create: {
      id: 'service-treatment-001',
      clinicId: clinic.id,
      name: 'Tratamiento de Conducto',
      description: 'Tratamiento endodóntico completo',
      duration: 60,
      price: 450,
    },
  });

  await prisma.service.upsert({
    where: { id: 'service-extraction-001' },
    update: {},
    create: {
      id: 'service-extraction-001',
      clinicId: clinic.id,
      name: 'Extracción Dental',
      description: 'Extracción segura de piezas dentales',
      duration: 45,
      price: 200,
    },
  });

  // Create clinic schedule (operating hours)
  // Monday to Saturday: 08:00 - 18:00, Sunday: closed
  for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
    await prisma.schedule.upsert({
      where: {
        clinicId_dayOfWeek: {
          clinicId: clinic.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        clinicId: clinic.id,
        dayOfWeek,
        startTime: '08:00',
        endTime: '18:00',
        isActive: true,
      },
    });
  }
  console.log(`✅ Schedule created (Mon-Sat: 08:00-18:00)`);

  // Create sample treatment
  const treatment = await prisma.treatment.upsert({
    where: { id: 'treatment-sample-001' },
    update: {},
    create: {
      id: 'treatment-sample-001',
      patientId: patient.id,
      serviceId: service.id,
      diagnosis: 'Caries profunda en pieza 16',
      treatment: 'Obturación con resina compuesta',
      notes: 'Paciente con antecedente de hipersensibilidad',
      observations: 'Proceder con cuidado, usar desensibilizante',
      cost: 150,
      performedBy: dentist.id,
      scheduledDate: new Date('2026-04-20T10:00:00'),
      status: 'PENDING',
    },
  });
  console.log(`✅ Sample treatment created: ${treatment.id}`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Test credentials (password: secret):');
  console.log(`  🔐 Admin: admin@odontosuites.com`);
  console.log(`  🦷 Dentist: doctor.garcia@odontosuites.com`);
  console.log(`  📞 Secretary: secretaria@odontosuites.com`);
  console.log(`  👤 Patient: paciente@odontosuites.com`);
  console.log('\nTest IDs (for appointments):');
  console.log(`  Clinic: ${clinic.id}`);
  console.log(`  Dentist: ${dentist.id}`);
  console.log(`  Patient: ${patient.id}`);
  console.log(`  Service (Cleaning): ${service.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
