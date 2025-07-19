import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ClientRetryPluginContext } from "@orpc/client/plugins";
import {
  ClientRetryPlugin,
  SimpleCsrfProtectionLinkPlugin,
} from "@orpc/client/plugins";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

import { env } from "@/env";
import router from "@/server/router";

interface ORPCClientContext extends ClientRetryPluginContext {}

const link = new RPCLink<ORPCClientContext>({
  url: `${env.VITE_BASE_URL}/api`,
  headers: createIsomorphicFn()
    .client(() => ({
      "accept-encoding": "br, gzip, deflate",
      accept: "application/json",
    }))
    .server(() => {
      const baseHeaders = getHeaders() || {};

      return {
        ...baseHeaders,
        "accept-encoding": "br, gzip, deflate",
        accept: "application/json",
      };
    }),
  plugins: [new ClientRetryPlugin({}), new SimpleCsrfProtectionLinkPlugin()],
  fetch: (request, init) =>
    globalThis.fetch(request, {
      ...init,
      credentials: "same-origin",
    }),
});

const client: RouterClient<typeof router, ORPCClientContext> =
  createORPCClient(link);
export const orpc = createORPCReactQueryUtils(client);
