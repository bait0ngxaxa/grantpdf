ALTER TABLE `UserFile`
    ADD COLUMN `deletion_attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `deletion_next_attempt_at` TIMESTAMP(6) NULL,
    ADD COLUMN `deletion_last_error` VARCHAR(255) NULL;

CREATE INDEX `UserFile_deletion_status_updated_at_idx`
    ON `UserFile`(`deletion_status`, `updated_at`);

CREATE INDEX `UserFile_deletion_status_next_attempt_at_idx`
    ON `UserFile`(`deletion_status`, `deletion_next_attempt_at`);
