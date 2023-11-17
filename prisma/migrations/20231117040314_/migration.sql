-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "twitterContentTag" TEXT;

-- AlterTable
ALTER TABLE "PossibleDate" ADD COLUMN     "hours" TEXT NOT NULL DEFAULT '';
