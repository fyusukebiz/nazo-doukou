/*
  Warnings:

  - A unique constraint covering the columns `[eventLocationId,date]` on the table `EventLocationDate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventLocationDate_eventLocationId_date_key" ON "EventLocationDate"("eventLocationId", "date");
