-- AlterTable
ALTER TABLE "Kratong" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinnedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Kratong_pinned_status_idx" ON "Kratong"("pinned", "status");
