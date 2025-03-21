/*
  Warnings:

  - You are about to drop the column `bookmakerId` on the `SideBet` table. All the data in the column will be lost.
  - Added the required column `bookmakerName` to the `SideBet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SideBet" DROP COLUMN "bookmakerId",
ADD COLUMN     "bookmakerName" TEXT NOT NULL;
