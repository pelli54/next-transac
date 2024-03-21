-- DropForeignKey
ALTER TABLE "Petition" DROP CONSTRAINT "Petition_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Petition" DROP CONSTRAINT "Petition_transmitterId_fkey";

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_transmitterId_fkey" FOREIGN KEY ("transmitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
