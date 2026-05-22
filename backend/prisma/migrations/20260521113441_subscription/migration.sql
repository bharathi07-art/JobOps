/*
  Warnings:

  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `aiSearchesUsed` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `autoRenew` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `billingCycle` VARCHAR(191) NULL,
    ADD COLUMN `lastResetDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `maxAISearches` INTEGER NOT NULL DEFAULT 4,
    ADD COLUMN `maxResumeUploads` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `maxSavedJobs` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `paymentProvider` VARCHAR(191) NULL,
    ADD COLUMN `razorpayCustomerId` VARCHAR(191) NULL,
    ADD COLUMN `resumeUploadsCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `savedJobsCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL,
    ADD COLUMN `subscriptionEndDate` DATETIME(3) NULL,
    ADD COLUMN `subscriptionPlan` VARCHAR(191) NOT NULL DEFAULT 'Free',
    ADD COLUMN `subscriptionStartDate` DATETIME(3) NULL,
    ADD COLUMN `subscriptionStatus` VARCHAR(191) NOT NULL DEFAULT 'inactive';

-- DropTable
DROP TABLE `subscription`;

-- CreateTable
CREATE TABLE `PlanSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planName` VARCHAR(191) NOT NULL,
    `monthlyPrice` DOUBLE NOT NULL DEFAULT 0,
    `yearlyPrice` DOUBLE NOT NULL DEFAULT 0,
    `features` VARCHAR(191) NOT NULL,
    `aiSearches` INTEGER NOT NULL DEFAULT 0,
    `savedJobs` INTEGER NOT NULL DEFAULT 0,
    `resumeUploads` INTEGER NOT NULL DEFAULT 0,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT false,
    `prioritySupport` BOOLEAN NOT NULL DEFAULT false,
    `advancedAnalytics` BOOLEAN NOT NULL DEFAULT false,
    `atsScoring` BOOLEAN NOT NULL DEFAULT false,
    `skillGapAnalysis` BOOLEAN NOT NULL DEFAULT false,
    `careerRoadmap` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `planName` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `previousPlan` VARCHAR(191) NULL,
    `newPlan` VARCHAR(191) NULL,
    `amount` DOUBLE NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `paymentProvider` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `transactionId` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SubscriptionHistory_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsageTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aiSearchesUsed` INTEGER NOT NULL DEFAULT 0,
    `jobsSaved` INTEGER NOT NULL DEFAULT 0,
    `resumesUploaded` INTEGER NOT NULL DEFAULT 0,
    `aiQuestionsAsked` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UsageTracking_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'Medium',
    `reply` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlanSubscriptionToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PlanSubscriptionToUser_AB_unique`(`A`, `B`),
    INDEX `_PlanSubscriptionToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_stripeCustomerId_key` ON `User`(`stripeCustomerId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_razorpayCustomerId_key` ON `User`(`razorpayCustomerId`);

-- AddForeignKey
ALTER TABLE `SubscriptionHistory` ADD CONSTRAINT `SubscriptionHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsageTracking` ADD CONSTRAINT `UsageTracking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanSubscriptionToUser` ADD CONSTRAINT `_PlanSubscriptionToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `PlanSubscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanSubscriptionToUser` ADD CONSTRAINT `_PlanSubscriptionToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
