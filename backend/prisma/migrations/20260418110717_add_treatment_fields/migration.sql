/*
  Warnings:

  - Added the required column `performedBy` to the `treatments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledDate` to the `treatments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `treatments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "performedBy" TEXT NOT NULL,
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "serviceId" TEXT NOT NULL,
ALTER COLUMN "appointmentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "treatments_serviceId_idx" ON "treatments"("serviceId");

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
