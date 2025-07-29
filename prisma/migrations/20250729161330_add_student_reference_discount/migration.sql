/*
  Warnings:

  - You are about to drop the column `discount_id` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_discount_id_fkey`;

-- DropIndex
DROP INDEX `students_discount_id_fkey` ON `students`;

-- AlterTable
ALTER TABLE `students` DROP COLUMN `discount_id`;

-- CreateTable
CREATE TABLE `student_reference_discounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference_student_id` INTEGER NOT NULL,
    `new_student_id` INTEGER NOT NULL,
    `discount_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_reference_discounts` ADD CONSTRAINT `student_reference_discounts_reference_student_id_fkey` FOREIGN KEY (`reference_student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_reference_discounts` ADD CONSTRAINT `student_reference_discounts_new_student_id_fkey` FOREIGN KEY (`new_student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_reference_discounts` ADD CONSTRAINT `student_reference_discounts_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
