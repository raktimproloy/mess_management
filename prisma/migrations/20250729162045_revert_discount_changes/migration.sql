/*
  Warnings:

  - You are about to drop the `student_reference_discounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `student_reference_discounts` DROP FOREIGN KEY `student_reference_discounts_discount_id_fkey`;

-- DropForeignKey
ALTER TABLE `student_reference_discounts` DROP FOREIGN KEY `student_reference_discounts_new_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `student_reference_discounts` DROP FOREIGN KEY `student_reference_discounts_reference_student_id_fkey`;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `discount_id` INTEGER NULL;

-- DropTable
DROP TABLE `student_reference_discounts`;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
