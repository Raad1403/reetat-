import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    
    if (key !== "reset-reetat-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = [];

    // حذف الجداول القديمة بالترتيب الصحيح
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "ProjectImage" CASCADE`;
      results.push("✅ Dropped ProjectImage");
    } catch (e: any) {
      results.push(`⚠️ ProjectImage: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "ProjectLogo" CASCADE`;
      results.push("✅ Dropped ProjectLogo");
    } catch (e: any) {
      results.push(`⚠️ ProjectLogo: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "GeneratedContent" CASCADE`;
      results.push("✅ Dropped GeneratedContent");
    } catch (e: any) {
      results.push(`⚠️ GeneratedContent: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "Project" CASCADE`;
      results.push("✅ Dropped Project");
    } catch (e: any) {
      results.push(`⚠️ Project: ${e.message}`);
    }

    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE`;
      results.push("✅ Dropped User");
    } catch (e: any) {
      results.push(`⚠️ User: ${e.message}`);
    }

    // إنشاء جدول User
    try {
      await prisma.$executeRaw`
        CREATE TABLE "User" (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          "companyName" TEXT,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          "passwordHash" TEXT NOT NULL,
          "subscriptionPlan" TEXT NOT NULL DEFAULT 'FREE',
          "subscriptionEndAt" TIMESTAMP,
          "adCredits" INTEGER NOT NULL DEFAULT 0,
          "usedTrialAds" INTEGER NOT NULL DEFAULT 0,
          "emailVerified" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      results.push("✅ Created User table");
    } catch (e: any) {
      results.push(`❌ User table: ${e.message}`);
    }

    // إنشاء جدول Project
    try {
      await prisma.$executeRaw`
        CREATE TABLE "Project" (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          city TEXT,
          budget TEXT,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          "logoUrl" TEXT,
          "publicId" TEXT UNIQUE,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "userId" INTEGER NOT NULL,
          FOREIGN KEY ("userId") REFERENCES "User"(id)
        )
      `;
      results.push("✅ Created Project table");
    } catch (e: any) {
      results.push(`❌ Project table: ${e.message}`);
    }

    // إنشاء جدول GeneratedContent
    try {
      await prisma.$executeRaw`
        CREATE TABLE "GeneratedContent" (
          id SERIAL PRIMARY KEY,
          "projectId" INTEGER UNIQUE NOT NULL,
          "heroAd" TEXT NOT NULL,
          "instagramPost" TEXT NOT NULL,
          "whatsappMessage" TEXT NOT NULL,
          "logoIdea" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY ("projectId") REFERENCES "Project"(id)
        )
      `;
      results.push("✅ Created GeneratedContent table");
    } catch (e: any) {
      results.push(`❌ GeneratedContent table: ${e.message}`);
    }

    // إنشاء جدول ProjectLogo
    try {
      await prisma.$executeRaw`
        CREATE TABLE "ProjectLogo" (
          id SERIAL PRIMARY KEY,
          "projectId" INTEGER NOT NULL,
          url TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY ("projectId") REFERENCES "Project"(id)
        )
      `;
      results.push("✅ Created ProjectLogo table");
    } catch (e: any) {
      results.push(`❌ ProjectLogo table: ${e.message}`);
    }

    // إنشاء جدول ProjectImage
    try {
      await prisma.$executeRaw`
        CREATE TABLE "ProjectImage" (
          id SERIAL PRIMARY KEY,
          "projectId" INTEGER NOT NULL,
          url TEXT NOT NULL,
          kind TEXT NOT NULL DEFAULT 'generated',
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY ("projectId") REFERENCES "Project"(id)
        )
      `;
      results.push("✅ Created ProjectImage table");
    } catch (e: any) {
      results.push(`❌ ProjectImage table: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Database reset completed!",
      results: results,
      nextStep: "Now try registering at https://reetat.com/auth/register",
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
