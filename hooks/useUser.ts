"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";


export function useUser() {
  const { data: session } = useSession(); // Fetch user session from NextAuth
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState<string | null>(null);
  // do not modify
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
      setName(session.user.name ?? null);
    }
  }, [session]);

  return {
    userId,
    name,
    setName,
  };
}
