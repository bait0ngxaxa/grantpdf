ALTER TABLE `document_idempotency`
ADD COLUMN `request_hash` VARCHAR(64) NULL;
