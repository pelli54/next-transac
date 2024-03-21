/*
  Warnings:

  - You are about to drop the column `recieverId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_recieverId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "recieverId",
ADD COLUMN     "receiverId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
