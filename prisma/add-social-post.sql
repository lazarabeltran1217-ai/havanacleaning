-- Social Media Posts table
-- Run this in Supabase SQL Editor if prisma db push hangs

-- Create the enum type
DO $$ BEGIN
  CREATE TYPE "SocialPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create the table
CREATE TABLE IF NOT EXISTS "SocialPost" (
  "id" TEXT NOT NULL,
  "platforms" JSONB NOT NULL,
  "contentType" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "contentEs" TEXT,
  "hashtags" JSONB,
  "imagePrompt" TEXT,
  "imageUrl" TEXT,
  "callToAction" TEXT,
  "status" "SocialPostStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledFor" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "publishResults" JSONB,
  "failureReason" TEXT,
  "aiModel" TEXT,
  "aiPromptUsed" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "SocialPost_status_idx" ON "SocialPost"("status");
CREATE INDEX IF NOT EXISTS "SocialPost_scheduledFor_idx" ON "SocialPost"("scheduledFor");
CREATE INDEX IF NOT EXISTS "SocialPost_createdAt_idx" ON "SocialPost"("createdAt");
