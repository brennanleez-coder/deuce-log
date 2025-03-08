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
    "/session/:path*",  // Ensures dynamic session ID routes are protected
  ],
};
