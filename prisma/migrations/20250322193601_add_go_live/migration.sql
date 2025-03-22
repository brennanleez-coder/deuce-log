/*
  Warnings:

  - You are about to drop the `SideBet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SideBet" DROP CONSTRAINT "SideBet_bettorId_fkey";

-- DropForeignKey
ALTER TABLE "SideBet" DROP CONSTRAINT "SideBet_matchId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "betsExpireAt" TIMESTAMP(3),
ADD COLUMN     "goLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "liveAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "SideBet";
