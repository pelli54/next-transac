/*
  Warnings:

  - Added the required column `code` to the `Cut` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cut" ADD COLUMN     "code" TEXT NOT NULL;
