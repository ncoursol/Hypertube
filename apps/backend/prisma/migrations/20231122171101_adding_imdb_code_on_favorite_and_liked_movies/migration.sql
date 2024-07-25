-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ViewedMovie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imdb_code" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "ViewedMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ViewedMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ViewedMovie" ("createdAt", "id", "movieId", "userId") SELECT "createdAt", "id", "movieId", "userId" FROM "ViewedMovie";
DROP TABLE "ViewedMovie";
ALTER TABLE "new_ViewedMovie" RENAME TO "ViewedMovie";
CREATE TABLE "new_FavoriteMovie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imdb_code" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "FavoriteMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FavoriteMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FavoriteMovie" ("createdAt", "id", "movieId", "userId") SELECT "createdAt", "id", "movieId", "userId" FROM "FavoriteMovie";
DROP TABLE "FavoriteMovie";
ALTER TABLE "new_FavoriteMovie" RENAME TO "FavoriteMovie";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
