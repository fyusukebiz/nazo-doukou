/*
  Warnings:

  - You are about to drop the column `date` on the `Recruit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recruit" DROP COLUMN "date";

-- CreateTable
CREATE TABLE "PossibleDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "priority" INTEGER NOT NULL,
    "recruitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PossibleDate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PossibleDate" ADD CONSTRAINT "PossibleDate_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
