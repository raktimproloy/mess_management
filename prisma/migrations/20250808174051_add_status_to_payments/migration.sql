-- AlterTable
ALTER TABLE `payments` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';
