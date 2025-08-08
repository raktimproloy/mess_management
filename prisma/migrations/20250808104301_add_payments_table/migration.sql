/*
  Warnings:

  - You are about to drop the column `category` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `category`,
    ADD COLUMN `booking_amount` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trxid` VARCHAR(191) NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `from_details` VARCHAR(191) NULL,
    `payment_date` VARCHAR(191) NULL,
    `payment_time` VARCHAR(191) NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_trxid_key`(`trxid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
