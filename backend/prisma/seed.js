"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const node_process_1 = require("node:process");
const prisma = new client_1.PrismaClient();
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
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    node_process_1.process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
