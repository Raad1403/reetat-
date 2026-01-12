-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "heroAd" TEXT NOT NULL,
    "instagramPost" TEXT NOT NULL,
    "whatsappMessage" TEXT NOT NULL,
    "logoIdea" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneratedContent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContent_projectId_key" ON "GeneratedContent"("projectId");
