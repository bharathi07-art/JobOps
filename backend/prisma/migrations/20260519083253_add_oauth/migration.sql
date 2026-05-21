/*
  Warnings:

  - A unique constraint covering the columns `[googleID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[githubID]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `githubID` VARCHAR(191) NULL,
    ADD COLUMN `googleID` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_googleID_key` ON `User`(`googleID`);

-- CreateIndex
CREATE UNIQUE INDEX `User_githubID_key` ON `User`(`githubID`);
