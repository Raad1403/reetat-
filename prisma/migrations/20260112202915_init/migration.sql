-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionEndAt" DATETIME,
    "adCredits" INTEGER NOT NULL DEFAULT 0,
    "usedTrialAds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("companyName", "createdAt", "email", "id", "name", "passwordHash", "phone", "subscriptionEndAt", "subscriptionPlan", "updatedAt") SELECT "companyName", "createdAt", "email", "id", "name", "passwordHash", "phone", "subscriptionEndAt", "subscriptionPlan", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
