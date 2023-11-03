-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "LikeOrDislike" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "iconImageFileKey" TEXT,
    "role" "Role",
    "sex" "Sex",
    "age" INTEGER,
    "startedAt" TIMESTAMP(3),
    "description" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "GameType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGameType" (
    "id" TEXT NOT NULL,
    "likeOrDislike" "LikeOrDislike" NOT NULL,
    "userId" TEXT NOT NULL,
    "gameTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGameType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT,
    "coverImageFileKey" TEXT,
    "numberOfPeopleInTeam" TEXT,
    "timeRequired" TEXT,
    "twitterTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventGameType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "gameTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventGameType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prefecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefectureId" TEXT NOT NULL,
    "color" TEXT,
    "bgColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLocationEvent" (
    "id" TEXT NOT NULL,
    "building" TEXT,
    "description" TEXT,
    "startedAt" DATE,
    "endedAt" DATE,
    "detailedSchedule" TEXT,
    "eventId" TEXT NOT NULL,
    "eventLocationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventLocationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventName" TEXT,
    "eventLocation" TEXT,
    "eventId" TEXT,
    "eventLocationEventId" TEXT,
    "numberOfPeople" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitTagRecruit" (
    "id" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "recruitTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitTagRecruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PossibleDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "priority" INTEGER,
    "recruitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PossibleDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentToRecruit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentToRecruit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserGameType_userId_gameTypeId_key" ON "UserGameType"("userId", "gameTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_name_key" ON "Event"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventGameType_eventId_gameTypeId_key" ON "EventGameType"("eventId", "gameTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Prefecture_name_key" ON "Prefecture"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Prefecture_sort_key" ON "Prefecture"("sort");

-- CreateIndex
CREATE UNIQUE INDEX "EventLocation_prefectureId_name_key" ON "EventLocation"("prefectureId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitTagRecruit_recruitId_recruitTagId_key" ON "RecruitTagRecruit"("recruitId", "recruitTagId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameType" ADD CONSTRAINT "UserGameType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameType" ADD CONSTRAINT "UserGameType_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "GameType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGameType" ADD CONSTRAINT "EventGameType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGameType" ADD CONSTRAINT "EventGameType_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "GameType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLocation" ADD CONSTRAINT "EventLocation_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "Prefecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLocationEvent" ADD CONSTRAINT "EventLocationEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLocationEvent" ADD CONSTRAINT "EventLocationEvent_eventLocationId_fkey" FOREIGN KEY ("eventLocationId") REFERENCES "EventLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruit" ADD CONSTRAINT "Recruit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruit" ADD CONSTRAINT "Recruit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruit" ADD CONSTRAINT "Recruit_eventLocationEventId_fkey" FOREIGN KEY ("eventLocationEventId") REFERENCES "EventLocationEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitTagRecruit" ADD CONSTRAINT "RecruitTagRecruit_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitTagRecruit" ADD CONSTRAINT "RecruitTagRecruit_recruitTagId_fkey" FOREIGN KEY ("recruitTagId") REFERENCES "RecruitTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PossibleDate" ADD CONSTRAINT "PossibleDate_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentToRecruit" ADD CONSTRAINT "CommentToRecruit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentToRecruit" ADD CONSTRAINT "CommentToRecruit_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
