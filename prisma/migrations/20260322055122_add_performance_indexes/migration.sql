-- CreateIndex
CREATE INDEX `Project_userId_created_at_idx` ON `Project`(`userId`, `created_at`);

-- CreateIndex
CREATE INDEX `Project_status_created_at_idx` ON `Project`(`status`, `created_at`);

-- CreateIndex
CREATE INDEX `Project_created_at_idx` ON `Project`(`created_at`);

-- CreateIndex
CREATE INDEX `Project_name_idx` ON `Project`(`name`);

-- CreateIndex
CREATE INDEX `User_created_at_idx` ON `User`(`created_at`);

-- CreateIndex
CREATE INDEX `User_name_idx` ON `User`(`name`);

-- CreateIndex
CREATE INDEX `UserFile_projectId_created_at_idx` ON `UserFile`(`projectId`, `created_at`);

-- CreateIndex
CREATE INDEX `UserFile_created_at_idx` ON `UserFile`(`created_at`);
