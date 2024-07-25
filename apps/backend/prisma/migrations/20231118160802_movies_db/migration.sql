-- CreateTable
CREATE TABLE "Movies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movie_id" INTEGER NOT NULL,
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
