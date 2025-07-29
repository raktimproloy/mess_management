-- AlterTable
ALTER TABLE `students` ADD COLUMN `discount_id` INTEGER NULL,
    ADD COLUMN `reference_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_reference_id_fkey` FOREIGN KEY (`reference_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
