ALTER TABLE `UserFile`
    ADD COLUMN `deletion_status` VARCHAR(16) NOT NULL DEFAULT 'active';

CREATE INDEX `UserFile_deletion_status_created_at_idx`
    ON `UserFile`(`deletion_status`, `created_at`);
