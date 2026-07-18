ALTER TABLE `document_idempotency`
ADD COLUMN `lease_token` VARCHAR(64) NULL,
ADD COLUMN `lease_expires_at` TIMESTAMP(6) NULL;
