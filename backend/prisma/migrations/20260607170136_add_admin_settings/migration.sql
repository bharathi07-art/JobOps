-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailAutomationResumeText` TEXT NULL;

-- CreateTable
CREATE TABLE `adminsettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `platformName` VARCHAR(191) NOT NULL DEFAULT 'JobOps',
    `supportEmail` VARCHAR(191) NOT NULL DEFAULT 'support@jobops.ai',
    `maxFreeAIRequestsPerMonth` INTEGER NOT NULL DEFAULT 4,
    `maxProAIRequestsPerDay` INTEGER NOT NULL DEFAULT 1,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `newUserRegistrationsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `aiMatchingFeatureEnabled` BOOLEAN NOT NULL DEFAULT true,
    `pwaSupport` BOOLEAN NOT NULL DEFAULT true,
    `activeAIProvider` VARCHAR(191) NOT NULL DEFAULT 'Gemini',
    `aiModelName` VARCHAR(191) NOT NULL DEFAULT 'gemini-1.5-flash',
    `aiApiKey` TEXT NULL,
    `maxTokensPerRequest` INTEGER NOT NULL DEFAULT 2048,
    `requestTimeout` INTEGER NOT NULL DEFAULT 30,
    `retryAttempts` INTEGER NOT NULL DEFAULT 3,
    `fallbackToOpenAI` BOOLEAN NOT NULL DEFAULT false,
    `requestLogging` BOOLEAN NOT NULL DEFAULT true,
    `rateLimiting` BOOLEAN NOT NULL DEFAULT true,
    `freePlanPrice` DOUBLE NOT NULL DEFAULT 0,
    `freePlanFeatures` TEXT NULL,
    `monthlyPlanPrice` DOUBLE NOT NULL DEFAULT 20,
    `monthlyPlanFeatures` TEXT NULL,
    `yearlyPlanPrice` DOUBLE NOT NULL DEFAULT 220,
    `yearlyPlanFeatures` TEXT NULL,
    `notifyNewUsers` BOOLEAN NOT NULL DEFAULT true,
    `notifyBillingIssues` BOOLEAN NOT NULL DEFAULT true,
    `notifyAIFailures` BOOLEAN NOT NULL DEFAULT true,
    `notifyFeedback` BOOLEAN NOT NULL DEFAULT true,
    `weeklyAnalyticsReport` BOOLEAN NOT NULL DEFAULT false,
    `notifySubscriptionRenewals` BOOLEAN NOT NULL DEFAULT false,
    `twoFactorAuthRequired` BOOLEAN NOT NULL DEFAULT true,
    `sessionTimeout` BOOLEAN NOT NULL DEFAULT true,
    `ipAllowlist` BOOLEAN NOT NULL DEFAULT false,
    `auditLogging` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RenameIndex
ALTER TABLE `_plansubscriptiontouser` RENAME INDEX `_PlanSubscriptionToUser_AB_unique` TO `_plansubscriptiontouser_AB_unique`;

-- RenameIndex
ALTER TABLE `_plansubscriptiontouser` RENAME INDEX `_PlanSubscriptionToUser_B_index` TO `_plansubscriptiontouser_B_index`;
