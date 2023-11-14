/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `GameType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `StrongArea` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameType_name_key" ON "GameType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StrongArea_name_key" ON "StrongArea"("name");
