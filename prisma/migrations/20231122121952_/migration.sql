-- CreateEnum
CREATE TYPE "EventLocationDateType" AS ENUM ('RANGE', 'INDIVISUAL');

-- AlterTable
ALTER TABLE "EventLocation" ADD COLUMN     "dateType" "EventLocationDateType" NOT NULL DEFAULT 'RANGE';

-- AlterTable
ALTER TABLE "PossibleDate" ALTER COLUMN "hours" DROP DEFAULT;

-- CreateTable
CREATE TABLE "EventLocationDate" (
    "id" TEXT NOT NULL,
    "eventLocationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventLocationDate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventLocationDate" ADD CONSTRAINT "EventLocationDate_eventLocationId_fkey" FOREIGN KEY ("eventLocationId") REFERENCES "EventLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
