import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Check if we're using HTTPS
const isSecure = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRoles: { label: "Expected Roles", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Имэйл эсвэл нууц үг дутуу байна.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Имэйл эсвэл нууц үг буруу байна.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Имэйл эсвэл нууц үг буруу байна.");
        }

        const expectedRoles: string[] = credentials.expectedRoles
          ? JSON.parse(credentials.expectedRoles)
          : [];

        if (expectedRoles.length > 0 && !expectedRoles.includes(user.role)) {
          throw new Error(
            `Нэвтрэх эрхгүй байна. (${expectedRoles.join(", ")} ролуудын аль нэгтэй байх шаардлагатай)`
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure, // Only secure if using HTTPS
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure, // Only secure if using HTTPS
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure, // Only secure if using HTTPS
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
              accounts: true,
            },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split("@")[0],
                role: "USER",
                password: "",
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    id_token: account.id_token,
                    token_type: account.token_type,
                    scope: account.scope,
                    expires_at: account.expires_at,
                    session_state: account.session_state,
                  },
                },
              },
              include: {
                accounts: true,
              },
            });
            return true;
          } else {
            const hasGoogleAccount = existingUser.accounts.some(
              (acc) => acc.provider === "google"
            );

            if (!hasGoogleAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  id_token: account.id_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  expires_at: account.expires_at,
                  session_state: account.session_state,
                },
              });
            }

            return true;
          }
        } catch {
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("http")) {
        return url;
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      const session = await prisma.session.findFirst({
        where: { expires: { gt: new Date() } },
        include: { user: true },
        orderBy: { expires: "desc" },
      });

      if (session?.user) {
        const redirectUrl =
          session.user.role === "EMPLOYER" || session.user.role === "ADMIN"
            ? `${baseUrl}/employer/profile`
            : `${baseUrl}/jobseeker/profile`;
        return redirectUrl;
      }

      return baseUrl;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // Use token data first (from JWT)
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = token.role as string;
        }
        if (token.name) {
          session.user.name = token.name as string;
        }

        // Optionally refresh from DB (but don't fail if DB is unavailable)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: {
              id: true,
              role: true,
              name: true,
              email: true,
              image: true,
            },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
            session.user.name = dbUser.name || session.user.name;
            session.user.email = dbUser.email || session.user.email;
            session.user.image = dbUser.image || session.user.image;
          }
        } catch (error) {
          // If DB query fails, use token data (already set above)
          console.error("Session DB query error:", error);
        }
      }

      return session;
    },
    async jwt({ token, user, account, trigger }) {
      // Initial sign in - user object is available
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
      }

      // For OAuth providers, fetch user from DB
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }

      // Refresh token data if needed
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, name: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
          token.name = dbUser.name ?? undefined;
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
};
