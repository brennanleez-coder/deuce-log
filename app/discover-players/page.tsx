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

const fetchUsers = async () => {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
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
      className="min-h-screen bg-white font-sans px-4 md:px-10 pt-16 p-4 md:p-6" // 👈 Added padding to prevent overlap
    >
      <div className="flex flex-col gap-y-6 max-w-5xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative flex items-center justify-center mb-6"
        >
          {/* Back Button (left-aligned) */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute left-0 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Button>

          {/* Centered Title */}
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Discover Players
          </h1>
        </motion.header>

        {/* Loading State */}
        {isLoading && <Loader fullScreen />}

        {/* Error State */}
        {isError && (
          <p className="text-red-500 text-center">Failed to load players.</p>
        )}

        {/* Players List */}
        {!isLoading && !isError && users.length > 0 ? (
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
              const isFounder = user.email === "brennanlee95@gmail.com";
              const userNumber = index + 1;

              return (
                <motion.div
                  key={user.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center bg-gray-50 hover:bg-gray-100"
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
                  <h2 className="mt-3 font-semibold text-lg text-gray-900 text-center">
                    {user.name || "Unknown"}
                  </h2>
                  <p className="text-sm text-gray-500">{user.email}</p>

                  {/* Badges Section */}
                  <div className="mt-2 flex gap-2">
                    {isFounder ? (
                      <Badge className="bg-yellow-500 text-white">
                        🏆 Founder
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white">
                        User #{userNumber}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          !isLoading &&
          !isError && (
            <p className="text-center text-gray-500">No players found.</p>
          )
        )}
      </div>
    </motion.main>
  );
}
