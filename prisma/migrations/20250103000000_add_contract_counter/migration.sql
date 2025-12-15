-- CreateTable
CREATE TABLE `ContractCounter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contractType` VARCHAR(191) NOT NULL,
    `currentNumber` INTEGER NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `ContractCounter_contractType_key`(`contractType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert initial data for contract types
INSERT INTO `ContractCounter` (`contractType`, `currentNumber`) VALUES 
('ABS', 1),
('DMR', 1),
('SIP', 1);