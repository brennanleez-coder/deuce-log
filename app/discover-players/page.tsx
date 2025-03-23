"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Loader from "@/components/FullScreenLoader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const fetchUsers = async () => {
  const res = await fetch("/api/users");
  if (!res.ok) {
    toast.error("Failed to fetch users.");
  }
  return res.json();
};

const getBadgeForUser = (index: number, email: string) => {
  if (email === "brennanlee95@gmail.com") {
    return { text: "🏆 First Member", className: "bg-yellow-500 text-white" };
  } else if (index >= 2 && index <= 5) {
    return { text: "⭐ Core Member", className: "bg-blue-500 text-white" };
  } else if (index >= 6 && index <= 10) {
    return { text: "✨ Trusted Member", className: "bg-purple-500 text-white" };
  } else {
    return { text: "🔵 Community Member", className: "bg-gray-400 text-white" };
  }
};

export default function DiscoverPlayers() {
  const router = useRouter();
  const { userId } = useUser();

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen font-sans px-4 md:px-10 pt-16 text-slate-700 bg-white"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative flex items-center justify-center mb-6"
        >
          {/* Optional Back Button on the left */}
          <Button
            variant="ghost"
            className="absolute left-0 flex items-center gap-2"
            onClick={() => router.push("/track")}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>

          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Users className="w-6 h-6 text-blue-500" />
            Discover Players
          </h1>
        </motion.header>

        {/* Loading / Error States */}
        {isLoading && <Loader fullScreen />}
        {isError && (
          <p className="text-red-500 text-center">Failed to load players.</p>
        )}

        {/* List of Users */}
        {!isLoading && !isError && users?.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {users.map((user: any, index: number) => {
              const badge = getBadgeForUser(index + 1, user.email);

              return (
                <motion.div
                  key={user.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-xl p-5 flex flex-col items-center hover:shadow-md hover:bg-white transition cursor-pointer"
                >
                  <Avatar className="h-16 w-16">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name || "User"} />
                    ) : (
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0) : "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <h2 className="mt-3 font-medium text-lg text-slate-800 text-center truncate">
                    {user.name || "Unknown"}
                  </h2>

                  {/* Sessions & Matches */}
                  <div className="mt-2 flex flex-col items-center gap-1 text-xs text-slate-500">
                    <span className="whitespace-nowrap">
                      Sessions: {user?.badmintonSessions || 0}
                    </span>
                    <span className="whitespace-nowrap">
                      Matches: {user?.transactions || 0}
                    </span>
                  </div>

                  {/* Badge */}
                  <div className="mt-3">
                    <Badge className={`${badge.className} px-2 py-1`}>
                      {badge.text}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          !isLoading &&
          !isError && (
            <p className="text-center text-slate-500">
              No players found.
            </p>
          )
        )}
      </div>
    </motion.main>
  );
}
