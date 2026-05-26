ALTER TABLE `Project` ADD COLUMN `deleted_at` TIMESTAMP(6) NULL;

CREATE INDEX `Project_deleted_at_idx` ON `Project`(`deleted_at`);
