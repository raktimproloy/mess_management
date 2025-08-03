-- CreateTable
CREATE TABLE `complaints` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'checking', 'solved', 'canceled') NOT NULL DEFAULT 'pending',
    `complain_for` ENUM('mess', 'room') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
