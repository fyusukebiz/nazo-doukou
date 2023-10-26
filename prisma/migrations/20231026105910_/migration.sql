/*
  Warnings:

  - Added the required column `prefectureId` to the `EventLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventLocation" ADD COLUMN     "prefectureId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Recruit" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prefecture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prefecture_name_key" ON "Prefecture"("name");

-- AddForeignKey
ALTER TABLE "EventLocation" ADD CONSTRAINT "EventLocation_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "Prefecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
