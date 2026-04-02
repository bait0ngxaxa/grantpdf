-- Add buddhist year dimension for yearly reset contract numbering
ALTER TABLE `ContractCounter`
    ADD COLUMN `buddhistYear` INTEGER NULL;

-- Backfill existing rows to current Buddhist year
UPDATE `ContractCounter`
SET `buddhistYear` = YEAR(CURDATE()) + 543
WHERE `buddhistYear` IS NULL;

ALTER TABLE `ContractCounter`
    MODIFY COLUMN `buddhistYear` INTEGER NOT NULL;

-- Replace unique(contractType) with unique(contractType, buddhistYear)
DROP INDEX `ContractCounter_contractType_key` ON `ContractCounter`;

CREATE UNIQUE INDEX `ContractCounter_contractType_buddhistYear_key`
    ON `ContractCounter`(`contractType`, `buddhistYear`);
