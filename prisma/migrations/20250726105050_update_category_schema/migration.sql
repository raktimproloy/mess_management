/*
  Warnings:

  - You are about to drop the column `amount` on the `categories` table. All the data in the column will be lost.
  - Added the required column `rent_amount` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` DROP COLUMN `amount`,
    ADD COLUMN `external_amount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `rent_amount` DOUBLE NOT NULL;
