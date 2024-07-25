/*
  Warnings:

  - A unique constraint covering the columns `[imdb_code]` on the table `Movies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Movies_imdb_code_key" ON "Movies"("imdb_code");
