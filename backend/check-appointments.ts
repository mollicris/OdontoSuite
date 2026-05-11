import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando citas para el paciente...');

  // Buscar citas del teléfono 59179559800
  const appointments = await prisma.appointment.findMany({
    where: {
      patient: {
        phone: '59179559800',
      },
    },
    include: {
      patient: true,
      dentist: true,
      service: true,
      clinic: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n📋 Total de citas encontradas: ${appointments.length}\n`);

  if (appointments.length === 0) {
    console.log('❌ No hay citas registradas para este paciente');
  } else {
    appointments.forEach((apt, idx) => {
      console.log(`\nCita ${idx + 1}:`);
      console.log(`  Paciente: ${apt.patient.firstName} ${apt.patient.lastName}`);
      console.log(`  Teléfono: ${apt.patient.phone}`);
      console.log(`  Dentista: ${apt.dentist?.firstName || 'N/A'}`);
      console.log(`  Servicio: ${apt.service?.name || 'N/A'}`);
      console.log(`  Fecha: ${apt.startTime}`);
      console.log(`  Estado: ${apt.status}`);
      console.log(`  Creada: ${apt.createdAt}`);
    });
  }

  // También verificar conversaciones
  console.log('\n\n💬 Verificando conversaciones WhatsApp...');
  const conversations = await prisma.whatsAppConversation.findMany({
    where: {
      patientPhone: '59179559800',
    },
    include: {
      messages: true,
      patient: true,
    },
    orderBy: {
      lastActivity: 'desc',
    },
  });

  console.log(`\n📋 Total de conversaciones: ${conversations.length}\n`);

  conversations.forEach((conv, idx) => {
    console.log(`\nConversación ${idx + 1}:`);
    console.log(`  Clínica: ${conv.clinicId}`);
    console.log(`  Mensajes: ${conv.messages.length}`);
    console.log(`  Última actividad: ${conv.lastActivity}`);
    console.log(`  Paciente vinculado: ${conv.patientId ? 'Sí' : 'No'}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
