import { ORPCError } from "@orpc/client";
import { Session, User } from "better-auth";
import type { Simplify } from "type-fest";

import { orpc } from "@/lib/orpc";

type UserWithSession = {
  user: User;
  session: Session;
};

export interface Authenticated extends UserWithSession {
  isAuthenticated: true;
}

export interface Unauthenticated {
  isAuthenticated: false;
}

export type Auth = Simplify<Authenticated | Unauthenticated>;

export const getAuth = async (): Promise<Auth> => {
  try {
    const result = await orpc.user.me.call();

    if (!result.session || !result.user) {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      ...result,
    };
  } catch (error) {
    if (error instanceof ORPCError) {
      if (error.status !== 401 && error.defined) {
        console.error("Failed to fetch auth data", error);
      }
    }
    return { isAuthenticated: false };
  }
};
