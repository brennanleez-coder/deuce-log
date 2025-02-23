/*
  Warnings:

  - Added the required column `userId` to the `BadmintonSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BadmintonSession" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BadmintonSession" ADD CONSTRAINT "BadmintonSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
