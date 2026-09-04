import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      provider: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    provider: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    provider?: string;
    sessionId?: string;
    revoked?: boolean;
  }
}
