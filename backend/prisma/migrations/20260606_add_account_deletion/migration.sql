-- AlterTable - Add account deletion tracking fields
ALTER TABLE `user` ADD COLUMN `isDeletionScheduled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `deletionRequestedDate` DATETIME(3) NULL,
    ADD COLUMN `deletionScheduledDate` DATETIME(3) NULL,
    ADD COLUMN `recoveryDeadlineDate` DATETIME(3) NULL;

-- CreateTable - Account Recovery Requests
CREATE TABLE `AccountRecoveryRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `reasonForDeletion` TEXT NULL,
    `reasonForRecovery` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `deletedDate` DATETIME(3) NOT NULL,
    `recoveryRequestDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recoveryDeadlineDate` DATETIME(3) NOT NULL,
    `reviewedBy` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `cooldownEndDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable - Admin Notifications (if not exists)
CREATE TABLE IF NOT EXISTS `AdminNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'info',
    `relatedUserId` INTEGER NULL,
    `relatedRequestId` INTEGER NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
