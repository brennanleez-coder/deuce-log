-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "bettor" TEXT,
ADD COLUMN     "bettorWon" BOOLEAN,
ADD COLUMN     "bookmaker" TEXT,
ADD COLUMN     "payer" TEXT,
ADD COLUMN     "receiver" TEXT;
