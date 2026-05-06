-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subscriptionPlanId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "creditBalance" INTEGER NOT NULL DEFAULT 100,
    "billingResetDate" DATETIME,
    "apiKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "sourceRowId" TEXT NOT NULL,
    "businessName" TEXT,
    "decisionMaker" TEXT,
    "email" TEXT,
    "renewalDate" DATETIME,
    "daysToRenew" INTEGER,
    "industry" TEXT,
    "offerType" TEXT,
    "notes" TEXT,
    "normalizedJson" TEXT,
    "validationStatus" TEXT,
    "missingFieldsJson" TEXT,
    "campaignMode" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "finalOutputReady" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignRow_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrategyOutput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignRowId" TEXT NOT NULL,
    "strategicAngle" TEXT NOT NULL,
    "coreRisk" TEXT NOT NULL,
    "upsellBridge" TEXT NOT NULL,
    "valueOutcome" TEXT NOT NULL,
    "ctaDirection" TEXT NOT NULL,
    "toneGuidance" TEXT NOT NULL,
    "redFlags" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrategyOutput_campaignRowId_fkey" FOREIGN KEY ("campaignRowId") REFERENCES "CampaignRow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignRowId" TEXT NOT NULL,
    "subjectLine1" TEXT NOT NULL,
    "subjectLine2" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "personalizationUsed" TEXT NOT NULL,
    "writerNotes" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailDraft_campaignRowId_fkey" FOREIGN KEY ("campaignRowId") REFERENCES "CampaignRow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QAOutput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignRowId" TEXT NOT NULL,
    "qaStatus" TEXT NOT NULL,
    "spamRiskLevel" TEXT NOT NULL,
    "issuesFound" TEXT NOT NULL,
    "revisionsMade" TEXT NOT NULL,
    "finalSubjectLine1" TEXT NOT NULL,
    "finalSubjectLine2" TEXT NOT NULL,
    "finalPreviewText" TEXT NOT NULL,
    "finalEmailBody" TEXT NOT NULL,
    "finalCta" TEXT NOT NULL,
    "humanizationNotes" TEXT NOT NULL,
    "overallQualityScore" INTEGER NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "revisionCount" INTEGER NOT NULL,
    "topIssuesLoweringScore" TEXT NOT NULL,
    "requiredFixes" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QAOutput_campaignRowId_fkey" FOREIGN KEY ("campaignRowId") REFERENCES "CampaignRow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "monthlyCredits" INTEGER NOT NULL,
    "priceMonthly" REAL NOT NULL,
    "featuresJson" TEXT,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "trialDurationDays" INTEGER NOT NULL DEFAULT 14,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CreditRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionName" TEXT NOT NULL,
    "creditCost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ModelSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'OpenRouter',
    "selectedModel" TEXT NOT NULL,
    "fallbackModel" TEXT,
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "maxLength" INTEGER NOT NULL DEFAULT 1000,
    "costMode" TEXT NOT NULL DEFAULT 'Balanced',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelSetting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "campaignRowId" TEXT,
    "action" TEXT NOT NULL,
    "modelUsed" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "estimatedApiCost" REAL,
    "creditsCharged" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsageLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UsageLog_campaignRowId_fkey" FOREIGN KEY ("campaignRowId") REFERENCES "CampaignRow" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeBaseEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LearningLogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearningLogEntry_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_apiKey_key" ON "Organization"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CreditRule_actionName_key" ON "CreditRule"("actionName");

-- CreateIndex
CREATE UNIQUE INDEX "ModelSetting_organizationId_taskName_key" ON "ModelSetting"("organizationId", "taskName");
