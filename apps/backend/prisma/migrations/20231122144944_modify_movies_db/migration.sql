/*
  Warnings:

  - You are about to drop the column `movie_id` on the `Movies` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imdb_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file" TEXT,
    "dateDownload" DATETIME,
    "year" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "runtime" INTEGER NOT NULL,
    "genres" TEXT,
    "summary" TEXT,
    "language" TEXT NOT NULL,
    "background_image" TEXT NOT NULL
);
INSERT INTO "new_Movies" ("background_image", "createdAt", "dateDownload", "file", "genres", "id", "imdb_code", "language", "rating", "runtime", "summary", "title", "year") SELECT "background_image", "createdAt", "dateDownload", "file", "genres", "id", "imdb_code", "language", "rating", "runtime", "summary", "title", "year" FROM "Movies";
DROP TABLE "Movies";
ALTER TABLE "new_Movies" RENAME TO "Movies";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
