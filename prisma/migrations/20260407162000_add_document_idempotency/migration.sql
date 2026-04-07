CREATE TABLE `document_idempotency` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `document_type` VARCHAR(191) NOT NULL,
    `idempotency_key` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'processing',
    `response_status` INTEGER NULL,
    `response_body` JSON NULL,
    `error_message` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `completed_at` TIMESTAMP(6) NULL,

    UNIQUE INDEX `document_idempotency_userId_document_type_idempotency_key_key`(`userId`, `document_type`, `idempotency_key`),
    INDEX `document_idempotency_userId_created_at_idx`(`userId`, `created_at`),
    INDEX `document_idempotency_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `document_idempotency`
    ADD CONSTRAINT `document_idempotency_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
