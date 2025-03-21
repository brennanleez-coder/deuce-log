-- CreateTable
CREATE TABLE "SideBet" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "bettorId" TEXT NOT NULL,
    "bookmakerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bettorWon" BOOLEAN,

    CONSTRAINT "SideBet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SideBet" ADD CONSTRAINT "SideBet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SideBet" ADD CONSTRAINT "SideBet_bettorId_fkey" FOREIGN KEY ("bettorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
