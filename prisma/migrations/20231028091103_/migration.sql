/*
  Warnings:

  - You are about to drop the `EventHour` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventHour" DROP CONSTRAINT "EventHour_eventDateId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "numberOfPeopleInTeam" TEXT,
ADD COLUMN     "timeRequired" TEXT;

-- DropTable
DROP TABLE "EventHour";
