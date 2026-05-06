/*
  Warnings:

  - You are about to drop the `EmailDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KnowledgeBaseEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningLogEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QAOutput` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StrategyOutput` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `createdById` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `campaignMode` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `daysToRenew` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `decisionMaker` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `finalOutputReady` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `missingFieldsJson` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `normalizedJson` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `offerType` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `processingStatus` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `renewalDate` on the `CampaignRow` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `CreditRule` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `CreditRule` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `ModelSetting` table. All the data in the column will be lost.
  - You are about to drop the column `maxLength` on the `ModelSetting` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `ModelSetting` table. All the data in the column will be lost.
  - You are about to drop the column `featuresJson` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `isTrial` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyCredits` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `priceMonthly` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `trialDurationDays` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `features` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyCreditLimit` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Made the column `modelUsed` on table `UsageLog` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmailDraft";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "KnowledgeBaseEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LearningLogEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "QAOutput";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StrategyOutput";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InviteToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Campaign" ("createdAt", "id", "name", "organizationId", "updatedAt") SELECT "createdAt", "id", "name", "organizationId", "updatedAt" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE TABLE "new_CampaignRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "sourceRowId" TEXT NOT NULL,
    "businessName" TEXT,
    "contactEmail" TEXT,
    "contactName" TEXT,
    "validationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "strategyId" TEXT,
    "draftId" TEXT,
    "qaScore" REAL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignRow_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CampaignRow" ("businessName", "campaignId", "createdAt", "id", "sourceRowId", "updatedAt", "validationStatus") SELECT "businessName", "campaignId", "createdAt", "id", "sourceRowId", "updatedAt", coalesce("validationStatus", 'PENDING') AS "validationStatus" FROM "CampaignRow";
DROP TABLE "CampaignRow";
ALTER TABLE "new_CampaignRow" RENAME TO "CampaignRow";
CREATE TABLE "new_CreditRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionName" TEXT NOT NULL,
    "creditCost" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CreditRule" ("actionName", "createdAt", "creditCost", "id", "updatedAt") SELECT "actionName", "createdAt", "creditCost", "id", "updatedAt" FROM "CreditRule";
DROP TABLE "CreditRule";
ALTER TABLE "new_CreditRule" RENAME TO "CreditRule";
CREATE UNIQUE INDEX "CreditRule_actionName_key" ON "CreditRule"("actionName");
CREATE TABLE "new_ModelSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "selectedModel" TEXT NOT NULL,
    "purpose" TEXT,
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "maxOutputLength" INTEGER NOT NULL DEFAULT 2000,
    "costMode" TEXT NOT NULL DEFAULT 'BALANCED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fallbackModel" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelSetting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ModelSetting" ("costMode", "createdAt", "fallbackModel", "id", "organizationId", "selectedModel", "taskName", "temperature", "updatedAt") SELECT "costMode", "createdAt", "fallbackModel", "id", "organizationId", "selectedModel", "taskName", "temperature", "updatedAt" FROM "ModelSetting";
DROP TABLE "ModelSetting";
ALTER TABLE "new_ModelSetting" RENAME TO "ModelSetting";
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "subscriptionPlanId" TEXT,
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "billingResetDate" DATETIME,
    "apiKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Organization_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Organization" ("apiKey", "billingResetDate", "createdAt", "creditBalance", "id", "isActive", "name", "slug", "subscriptionPlanId", "subscriptionStatus", "updatedAt") SELECT "apiKey", "billingResetDate", "createdAt", "creditBalance", "id", "isActive", "name", "slug", "subscriptionPlanId", "subscriptionStatus", "updatedAt" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX "Organization_apiKey_key" ON "Organization"("apiKey");
CREATE TABLE "new_SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "monthlyCreditLimit" INTEGER NOT NULL,
    "basePrice" REAL NOT NULL,
    "features" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SubscriptionPlan" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "SubscriptionPlan";
DROP TABLE "SubscriptionPlan";
ALTER TABLE "new_SubscriptionPlan" RENAME TO "SubscriptionPlan";
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");
CREATE TABLE "new_UsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "campaignRowId" TEXT,
    "action" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "creditsCharged" INTEGER NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "estimatedApiCost" REAL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsageLog_campaignRowId_fkey" FOREIGN KEY ("campaignRowId") REFERENCES "CampaignRow" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UsageLog" ("action", "campaignId", "campaignRowId", "completionTokens", "creditsCharged", "errorMessage", "estimatedApiCost", "id", "modelUsed", "organizationId", "promptTokens", "success", "timestamp", "totalTokens", "userId") SELECT "action", "campaignId", "campaignRowId", "completionTokens", "creditsCharged", "errorMessage", "estimatedApiCost", "id", "modelUsed", "organizationId", "promptTokens", "success", "timestamp", "totalTokens", "userId" FROM "UsageLog";
DROP TABLE "UsageLog";
ALTER TABLE "new_UsageLog" RENAME TO "UsageLog";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "jobTitle" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT_ADMIN',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" DATETIME,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "organizationId", "passwordHash", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "organizationId", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_token_key" ON "InviteToken"("token");
