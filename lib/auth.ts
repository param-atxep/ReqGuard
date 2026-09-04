import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const authOptions = {
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const identifier = String(credentials.identifier).trim().toLowerCase();
        const password = String(credentials.password);
        const user = identifier.includes("@")
          ? await prisma.user.findUnique({ where: { email: identifier } })
          : await prisma.user.findUnique({ where: { username: identifier } });

        if (!user || !user.password || (process.env.NODE_ENV === "production" && user.email && !user.emailVerified)) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.fullName || user.username || undefined,
          role: user.role,
          image: user.image ?? undefined,
          provider: user.provider ?? "credentials",
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
        token.provider = user.provider;
        token.sessionId = token.jti ?? crypto.randomUUID();
        await prisma.session.upsert({
          where: { sessionToken: token.sessionId },
          create: { sessionToken: token.sessionId, userId: user.id, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), deviceName: "Web browser", deviceType: "browser", lastActiveAt: new Date() },
          update: { revokedAt: null, lastActiveAt: new Date() },
        });
      } else if (token.sessionId && !token.revoked) {
        const active = await prisma.session.findFirst({ where: { sessionToken: token.sessionId, revokedAt: null, expires: { gt: new Date() } }, select: { id: true } });
        if (!active) token.revoked = true;
        else await prisma.session.update({ where: { id: active.id }, data: { lastActiveAt: new Date() } });
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.revoked) return null;
      if (session.user) {
        session.user.id = token.sub ?? token.id ?? session.user.id;
        session.user.email = token.email ?? session.user.email;
        session.user.role = token.role ?? session.user.role;
        session.user.name = token.name ?? session.user.name;
        session.user.image = token.image ?? session.user.image;
        session.user.provider = token.provider ?? session.user.provider;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) return parsed.toString();
      } catch {
        // Ignore invalid external URLs and keep the user on the safe app base.
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/dashboard",
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};

const nextAuth = NextAuth(authOptions as any);

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;

export default async function authHandler(req: Request) {
  const method = req.method?.toUpperCase();
  if (method === "GET") return handlers.GET(req as any);
  if (method === "POST") return handlers.POST(req as any);
  return new Response(null, { status: 405 });
}
