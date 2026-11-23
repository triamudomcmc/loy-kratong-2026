-- CreateEnum
CREATE TYPE "KratongKind" AS ENUM ('STANDARD', 'PRINCIPAL', 'CUPSAA');

-- CreateEnum
CREATE TYPE "KratongStatus" AS ENUM ('PENDING', 'DISPLAYED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Kratong" (
    "id" TEXT NOT NULL,
    "kind" "KratongKind" NOT NULL,
    "kratong" JSONB NOT NULL,
    "wishName" TEXT NOT NULL,
    "wishContent" TEXT NOT NULL,
    "status" "KratongStatus" NOT NULL DEFAULT 'PENDING',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kratong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialKratong" (
    "id" TEXT NOT NULL,
    "kind" "KratongKind" NOT NULL,
    "kratong" JSONB NOT NULL,
    "wishName" TEXT NOT NULL,
    "wishContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialKratong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedWord" (
    "word" TEXT NOT NULL,

    CONSTRAINT "BlockedWord_pkey" PRIMARY KEY ("word")
);

-- CreateTable
CREATE TABLE "DictionaryWord" (
    "word" TEXT NOT NULL,

    CONSTRAINT "DictionaryWord_pkey" PRIMARY KEY ("word")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kratong_sourceId_key" ON "Kratong"("sourceId");

-- CreateIndex
CREATE INDEX "Kratong_status_createdAt_idx" ON "Kratong"("status", "createdAt");
