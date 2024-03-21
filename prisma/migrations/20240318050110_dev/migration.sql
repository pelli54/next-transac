/*
  Warnings:

  - Added the required column `producerId` to the `Cut` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cut" ADD COLUMN     "producerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Cut" ADD CONSTRAINT "Cut_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
