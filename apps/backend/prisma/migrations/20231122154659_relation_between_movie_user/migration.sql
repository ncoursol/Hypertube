-- CreateTable
CREATE TABLE "_MoviesToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MoviesToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Movies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MoviesToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_MoviesToUser_AB_unique" ON "_MoviesToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_MoviesToUser_B_index" ON "_MoviesToUser"("B");
