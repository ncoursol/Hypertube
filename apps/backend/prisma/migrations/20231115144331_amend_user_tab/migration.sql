-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "token" TEXT,
    "email_confirm_id" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "reset_pwd" TEXT,
    "language" TEXT NOT NULL DEFAULT 'english',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profile_picture" TEXT
);
INSERT INTO "new_User" ("createdAt", "email", "email_confirm_id", "firstName", "id", "lastName", "password", "salt", "token", "username") SELECT "createdAt", "email", "email_confirm_id", "firstName", "id", "lastName", "password", "salt", "token", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
