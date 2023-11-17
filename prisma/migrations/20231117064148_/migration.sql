/*
  Warnings:

  - Made the column `priority` on table `PossibleDate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PossibleDate" ALTER COLUMN "priority" SET NOT NULL;
