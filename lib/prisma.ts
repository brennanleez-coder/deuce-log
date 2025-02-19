// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // or ["error"], etc. if you'd like
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
