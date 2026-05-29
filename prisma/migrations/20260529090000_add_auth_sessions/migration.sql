CREATE TABLE `auth_sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `session_id` VARCHAR(64) NOT NULL,
    `refresh_token_hash` VARCHAR(128) NOT NULL,
    `family_id` VARCHAR(64) NOT NULL,
    `session_version` INTEGER NOT NULL DEFAULT 0,
    `expires_at` TIMESTAMP(6) NOT NULL,
    `revoked_at` TIMESTAMP(6) NULL,
    `rotated_at` TIMESTAMP(6) NULL,
    `last_used_at` TIMESTAMP(6) NULL,
    `ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(512) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `auth_sessions_session_id_key`(`session_id`),
    UNIQUE INDEX `auth_sessions_refresh_token_hash_key`(`refresh_token_hash`),
    INDEX `auth_sessions_user_id_expires_at_idx`(`user_id`, `expires_at`),
    INDEX `auth_sessions_family_id_idx`(`family_id`),
    INDEX `auth_sessions_user_id_session_version_idx`(`user_id`, `session_version`),
    INDEX `auth_sessions_revoked_at_idx`(`revoked_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `auth_sessions`
    ADD CONSTRAINT `auth_sessions_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
