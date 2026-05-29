-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailAutomationEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `emailAutomationFrequency` VARCHAR(191) NOT NULL DEFAULT 'inferred',
    ADD COLUMN `emailAutomationMaxResults` INTEGER NOT NULL DEFAULT 7,
    ADD COLUMN `emailAutomationSearchTime` VARCHAR(191) NOT NULL DEFAULT '09:00';
