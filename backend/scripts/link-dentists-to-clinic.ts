import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ID de la clínica por defecto
  const clinicId = 'f48805c5-e12b-4774-9465-6b29c880d005';

  // Obtener todos los dentistas (usuarios con rol de dentista)
  const dentists = await prisma.user.findMany({
    where: {
      dentistProfile: { isNot: null },
    },
    include: { dentistProfile: true },
  });

  console.log(`✅ Encontrados ${dentists.length} dentistas`);

  if (dentists.length === 0) {
    console.log('⚠️ No hay dentistas registrados en la BD');
    console.log('Primero crea dentistas con roles de dentista');
    return;
  }

  // Vincular cada dentista a la clínica
  const links = await Promise.all(
    dentists.map(dentist =>
      prisma.dentistClinic.upsert({
        where: {
          dentistId_clinicId: {
            dentistId: dentist.id,
            clinicId,
          },
        },
        update: { isActive: true },
        create: {
          dentistId: dentist.id,
          clinicId,
          isActive: true,
        },
      })
    )
  );

  console.log(`✅ ${links.length} dentistas vinculados a la clínica ${clinicId}`);
  links.forEach(link => {
    const dentist = dentists.find(d => d.id === link.dentistId);
    console.log(`  • ${dentist?.firstName} ${dentist?.lastName} (${dentist?.dentistProfile?.specialization})`);
  });
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
