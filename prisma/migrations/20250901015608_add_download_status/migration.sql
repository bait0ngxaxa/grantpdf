-- AlterTable
ALTER TABLE `userfile` ADD COLUMN `downloadStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `downloadedAt` DATETIME(3) NULL;
