/*
  Warnings:

  - You are about to drop the `ProducerAtCut` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransacAtCut` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProducerAtCut" DROP CONSTRAINT "ProducerAtCut_cutId_fkey";

-- DropForeignKey
ALTER TABLE "ProducerAtCut" DROP CONSTRAINT "ProducerAtCut_producerId_fkey";

-- DropForeignKey
ALTER TABLE "TransacAtCut" DROP CONSTRAINT "TransacAtCut_cutId_fkey";

-- DropForeignKey
ALTER TABLE "TransacAtCut" DROP CONSTRAINT "TransacAtCut_transacId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "cutId" INTEGER;

-- DropTable
DROP TABLE "ProducerAtCut";

-- DropTable
DROP TABLE "TransacAtCut";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cutId_fkey" FOREIGN KEY ("cutId") REFERENCES "Cut"("id") ON DELETE SET NULL ON UPDATE CASCADE;
