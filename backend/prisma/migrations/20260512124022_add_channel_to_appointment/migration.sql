-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'FRONTEND';

-- CreateIndex
CREATE INDEX "appointments_channel_idx" ON "appointments"("channel");
