-- CreateTable
CREATE TABLE "StrongArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrongArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStrongArea" (
    "id" TEXT NOT NULL,
    "likeOrDislike" "LikeOrDislike" NOT NULL,
    "userId" TEXT NOT NULL,
    "strongAreaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStrongArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStrongArea_userId_strongAreaId_key" ON "UserStrongArea"("userId", "strongAreaId");

-- AddForeignKey
ALTER TABLE "UserStrongArea" ADD CONSTRAINT "UserStrongArea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStrongArea" ADD CONSTRAINT "UserStrongArea_strongAreaId_fkey" FOREIGN KEY ("strongAreaId") REFERENCES "StrongArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
