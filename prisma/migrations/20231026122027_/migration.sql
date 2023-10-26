/*
  Warnings:

  - You are about to drop the column `nameJp` on the `EventLocation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "EventLocation_nameJp_key";

-- AlterTable
ALTER TABLE "EventLocation" DROP COLUMN "nameJp";
