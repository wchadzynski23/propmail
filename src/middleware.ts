import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/templates/:path*", "/send/:path*", "/settings/:path*", "/contacts/:path*", "/sent/:path*"],
};
