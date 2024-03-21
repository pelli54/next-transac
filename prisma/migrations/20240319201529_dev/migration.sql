/*
  Warnings:

  - You are about to drop the column `cutId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_cutId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "cutId";

-- CreateTable
CREATE TABLE "TransactionOnCuts" (
    "transactionId" INTEGER NOT NULL,
    "cutId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionOnCuts_pkey" PRIMARY KEY ("transactionId","cutId")
);

-- AddForeignKey
ALTER TABLE "TransactionOnCuts" ADD CONSTRAINT "TransactionOnCuts_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionOnCuts" ADD CONSTRAINT "TransactionOnCuts_cutId_fkey" FOREIGN KEY ("cutId") REFERENCES "Cut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
