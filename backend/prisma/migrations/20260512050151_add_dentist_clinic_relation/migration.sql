-- CreateTable
CREATE TABLE "dentist_clinics" (
    "id" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dentist_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dentist_clinics_dentistId_idx" ON "dentist_clinics"("dentistId");

-- CreateIndex
CREATE INDEX "dentist_clinics_clinicId_idx" ON "dentist_clinics"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "dentist_clinics_dentistId_clinicId_key" ON "dentist_clinics"("dentistId", "clinicId");

-- AddForeignKey
ALTER TABLE "dentist_clinics" ADD CONSTRAINT "dentist_clinics_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dentist_clinics" ADD CONSTRAINT "dentist_clinics_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
