ALTER TABLE `document_idempotency`
    ADD COLUMN `heartbeat_at` TIMESTAMP(6) NULL,
    ADD COLUMN `resource_type` VARCHAR(64) NULL,
    ADD COLUMN `resource_id` BIGINT NULL,
    ADD COLUMN `result_reference` JSON NULL;

CREATE INDEX `document_idempotency_resource_idx`
    ON `document_idempotency`(`resource_type`, `resource_id`);
