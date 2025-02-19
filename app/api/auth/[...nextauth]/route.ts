// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // ... add more providers here (GitHub, Email, Credentials, etc.)
  ],
  // The secret is used to encrypt session tokens
  secret: process.env.NEXTAUTH_SECRET,

  // If using JWT sessions (recommended), you can customize here:
  session: {
    strategy: "jwt",
  },

  // Customize callbacks if you need
  callbacks: {
    async jwt({ token, user }) {
      // If user just signed in, persist user.id onto the token
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // Expose the user.id as session.user.id
        (session.user as any).id = token.id
      }
      return session
    },
  },
}

// NextAuth() returns a request handler
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
