import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";

import { db } from "@/db";
import { env } from "@/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  // emailAndPassword: {
  //   enabled: true,
  // },
  socialProviders: {
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      getUserInfo: async (token) => {
        const response = await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });

        const guildMember = await fetch(
          `https://discord.com/api/users/@me/guilds/${env.DISCORD_SERVER_ID}/member`,
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          }
        );

        const guildMemberData = await guildMember.json();

        const roles = guildMemberData.roles as string[];
        const oneOfRoles = env.DISCORD_SERVER_ROLES.split(",").some((role) =>
          roles.includes(role)
        );

        if (!oneOfRoles) {
          throw new APIError("UNAUTHORIZED", {
            message: "You are not authorized to access Atlas.",
          });
        }

        const data = await response.json();
        return {
          user: {
            id: data.id as string,
            name: data.global_name as string,
            email: data.email as string,
            image: data.avatar as string,
            emailVerified: true,
          },
          data: data,
        };
      },
    },
  },
});
