/*
  Warnings:

  - You are about to drop the `_MoviesToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_MoviesToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_MoviesLiked" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MoviesLiked_A_fkey" FOREIGN KEY ("A") REFERENCES "Movies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MoviesLiked_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MoviesViewed" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MoviesViewed_A_fkey" FOREIGN KEY ("A") REFERENCES "Movies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MoviesViewed_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_MoviesLiked_AB_unique" ON "_MoviesLiked"("A", "B");

-- CreateIndex
CREATE INDEX "_MoviesLiked_B_index" ON "_MoviesLiked"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MoviesViewed_AB_unique" ON "_MoviesViewed"("A", "B");

-- CreateIndex
CREATE INDEX "_MoviesViewed_B_index" ON "_MoviesViewed"("B");
