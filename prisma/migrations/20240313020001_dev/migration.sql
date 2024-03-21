-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "adminId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Petition" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "transmitterId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Petition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_transmitterId_fkey" FOREIGN KEY ("transmitterId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
