import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');

    const clinics = await prisma.clinic.findMany();
    console.log(`Clinics (${clinics.length}):`);
    clinics.forEach(c => console.log(`  - ${c.id}: ${c.name}`));

    const patients = await prisma.patient.findMany();
    console.log(`\nPatients (${patients.length}):`);
    patients.forEach(p => console.log(`  - ${p.id}: ${p.firstName} ${p.lastName}`));

    const dentists = await prisma.user.findMany({
      where: { role: { name: 'dentist' } },
    });
    console.log(`\nDentists (${dentists.length}):`);
    dentists.forEach(d => console.log(`  - ${d.id}: ${d.firstName} ${d.lastName}`));

    const services = await prisma.service.findMany();
    console.log(`\nServices (${services.length}):`);
    services.forEach(s => console.log(`  - ${s.id}: ${s.name} (clinic: ${s.clinicId})`));

    // Now test create with detailed error
    if (clinics.length > 0 && patients.length > 0 && dentists.length > 0 && services.length > 0) {
      console.log('\n🚀 Testing appointment creation...');
      const apt = await prisma.appointment.create({
        data: {
          clinicId: clinics[0].id,
          patientId: patients[0].id,
          dentistId: dentists[0].id,
          serviceId: services[0].id,
          startTime: new Date('2026-04-20T09:00:00Z'),
          endTime: new Date('2026-04-20T09:30:00Z'),
        },
        include: { patient: true, dentist: true, service: true },
      });
      console.log('✅ Success!', apt.id);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.meta) console.error('Meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
