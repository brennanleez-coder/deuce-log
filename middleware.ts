import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login", // Redirect unauthenticated users
  },
});

export const config = {
  matcher: [
    "/discover-players",
    "/track",
    "/manage-players",
    // "/session/:path*",
    "/api/transactions",
    "/api/transactions/:path*",
    // "/api/badminton-sessions",
    // "/api/badminton-sessions/:path*",
    "/api/users",
    "/api/users/:path*",
  ],
};
