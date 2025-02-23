/*
  Warnings:

  - You are about to drop the column `bettor` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `bettorWon` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `bookmaker` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `payer` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `receiver` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "bettor",
DROP COLUMN "bettorWon",
DROP COLUMN "bookmaker",
DROP COLUMN "payer",
DROP COLUMN "receiver";

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_transactionId_key" ON "Settlement"("transactionId");

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
