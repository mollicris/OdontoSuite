import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Limpiando base de datos...');

    // Delete in order (respecting foreign keys)
    await prisma.appointment.deleteMany();
    console.log('✅ Appointments eliminadas');

    await prisma.treatment.deleteMany();
    console.log('✅ Treatments eliminadas');

    await prisma.medicalHistory.deleteMany();
    console.log('✅ Medical history eliminada');

    await prisma.service.deleteMany();
    console.log('✅ Services eliminados');

    await prisma.patient.deleteMany();
    console.log('✅ Pacientes eliminados');

    await prisma.schedule.deleteMany();
    console.log('✅ Schedules eliminados');

    await prisma.clinic.deleteMany();
    console.log('✅ Clínicas eliminadas');

    await prisma.dentistProfile.deleteMany();
    console.log('✅ Dentist profiles eliminados');

    await prisma.user.deleteMany();
    console.log('✅ Users eliminados');

    await prisma.role.deleteMany();
    console.log('✅ Roles eliminados');

    console.log('\n✨ Base de datos limpia!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
