-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "from" TEXT,
    "level" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false
);
