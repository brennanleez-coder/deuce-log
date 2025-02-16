'use client'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMatchTracker } from "@/hooks/useMatchTracker";

interface SessionStatsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
}

export default function SessionStatsDialog({
    isOpen,
    onClose,
    sessionId,
}: SessionStatsDialogProps) {
    const {
        getHeadToHeadForSession,
        calculateNetGain,
        calculateSettlement,
        calculateSideBetWinnings,
        calculateSideBetLosses,
        getSessionTransactions,
    } = useMatchTracker();

    const [headToHead, setHeadToHead] = useState<any>({});
    const [netGain, setNetGain] = useState<number>(0);
    const [sideBetWins, setSideBetWins] = useState<number>(0);
    const [sideBetLosses, setSideBetLosses] = useState<number>(0);

    useEffect(() => {
        if (!sessionId || !isOpen) return;

        // 1) Fetch head-to-head stats
        const stats = getHeadToHeadForSession(sessionId);
        console.log("Head-to-head stats:", stats);
        setHeadToHead(stats);

        // 2) Calculate session net gain
        const ng = calculateNetGain(sessionId);
        setNetGain(ng);

        // 3) Calculate side bet wins/losses
        const sessionTransactions = getSessionTransactions(sessionId);
        let wins = 0;
        let losses = 0;

        sessionTransactions.forEach((t) => {
            if (t.type === "SideBet") {
                const userWon =
                    (t.bettorWon && t.userSide === "Bettor") ||
                    (!t.bettorWon && t.userSide === "Bookmaker");
                if (userWon) wins += t.amount;
                else losses += t.amount;
            }
        });

        setSideBetWins(wins);
        setSideBetLosses(losses);

    }, [sessionId, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Session Stats</DialogTitle>
                    <DialogDescription>
                        Head-to-head and overall performance for this session.
                    </DialogDescription>
                </DialogHeader>

                {/* HEAD-TO-HEAD STATS */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Head-to-Head Stats (Matches Only)
                    </h3>

                    {Object.keys(headToHead).length === 0 ? (
                        <p className="text-sm text-gray-500">
                            You have no match records against anyone in this session.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Opponent</TableHead>
                                        <TableHead className="text-center">Matches</TableHead>
                                        <TableHead className="text-center">Wins</TableHead>
                                        <TableHead className="text-center">Losses</TableHead>
                                        <TableHead className="text-center">Net</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(headToHead).map(([opponent, data]: any) => {
                                        const { matches, wins, losses, net } = data;
                                        return (
                                            <TableRow key={opponent}>
                                                <TableCell>{opponent}</TableCell>
                                                <TableCell className="text-center">{matches}</TableCell>
                                                <TableCell className="text-center">{wins}</TableCell>
                                                <TableCell className="text-center">{losses}</TableCell>
                                                <TableCell className="text-center">
                                                    {net > 0 ? `+${net}` : net === 0 ? "-" : net}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* OVERALL SESSION STATS */}
                    <div className="space-y-2 mt-6 border-t pt-4">
                        <h4 className="text-md font-medium text-gray-700">
                            Overall Session Performance
                        </h4>
                        <div className="flex flex-col space-y-1 text-sm text-gray-700">
                            <div>
                                <span className="font-semibold">Net Gain:</span>{" "}
                                {netGain > 0 ? `+${netGain}` : netGain}
                            </div>
                            <div>
                                <span className="font-semibold">Side Bet Wins:</span> +{sideBetWins}
                            </div>
                            <div>
                                <span className="font-semibold">Side Bet Losses:</span> -{sideBetLosses}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
