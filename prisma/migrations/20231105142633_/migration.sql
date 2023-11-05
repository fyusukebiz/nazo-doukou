/*
  Warnings:

  - You are about to drop the column `eventLocation` on the `Recruit` table. All the data in the column will be lost.
  - You are about to drop the column `eventName` on the `Recruit` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Recruit" DROP COLUMN "eventLocation",
DROP COLUMN "eventName",
ADD COLUMN     "manualEventLocation" TEXT,
ADD COLUMN     "manualEventName" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
