-- CreateTable
CREATE TABLE `payment_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `rent_id` INTEGER NOT NULL,
    `rent_history_id` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `payment_method` VARCHAR(191) NOT NULL,
    `bikash_number` VARCHAR(191) NULL,
    `trx_id` VARCHAR(191) NULL,
    `total_amount` DOUBLE NOT NULL,
    `rent_amount` DOUBLE NOT NULL DEFAULT 0,
    `advance_amount` DOUBLE NOT NULL DEFAULT 0,
    `external_amount` DOUBLE NOT NULL DEFAULT 0,
    `previous_due_amount` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_requests` ADD CONSTRAINT `payment_requests_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_requests` ADD CONSTRAINT `payment_requests_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_requests` ADD CONSTRAINT `payment_requests_rent_id_fkey` FOREIGN KEY (`rent_id`) REFERENCES `rents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_requests` ADD CONSTRAINT `payment_requests_rent_history_id_fkey` FOREIGN KEY (`rent_history_id`) REFERENCES `rent_history`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
