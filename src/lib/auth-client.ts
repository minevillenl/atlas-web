import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/env";
import { authQueryOptions } from "@/features/auth/services/auth.query";

export const authClient = createAuthClient({
  baseURL: env.VITE_BASE_URL,
  fetchOptions: {
    // https://discord.com/channels/1288403910284935179/1288403910284935182/1311199374793244703
    onResponse: async () => {
      await window.getQueryClient().invalidateQueries(authQueryOptions());
      await window.getRouter().invalidate();
    },
  },
  plugins: [genericOAuthClient()],
});
