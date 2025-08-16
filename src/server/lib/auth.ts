import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";

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
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["identity"],
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "identity",
          clientId: env.IDENTITY_CLIENT_ID,
          clientSecret: env.IDENTITY_CLIENT_SECRET,
          authorizationUrl: "https://identity.dustydunes.net/authorize",
          tokenUrl: "https://identity.dustydunes.net/api/oidc/token",
          userInfoUrl: "https://identity.dustydunes.net/api/oidc/userinfo",
          scopes: ["openid", "profile", "email", "groups"],
        },
      ],
    }),
  ],
});
