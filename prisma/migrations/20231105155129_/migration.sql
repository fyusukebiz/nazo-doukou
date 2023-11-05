/*
  Warnings:

  - You are about to drop the column `eventId` on the `Recruit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recruit" DROP CONSTRAINT "Recruit_eventId_fkey";

-- AlterTable
ALTER TABLE "Recruit" DROP COLUMN "eventId";
