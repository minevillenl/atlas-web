// or '@orpc/server/node'
import { RPCHandler } from "@orpc/server/fetch";
import {
  CORSPlugin,
  ResponseHeadersPlugin,
  SimpleCsrfProtectionHandlerPlugin,
} from "@orpc/server/plugins";
import { createServerFileRoute } from "@tanstack/react-start/server";

import router from "@/server/router";

const handler = new RPCHandler(router, {
  plugins: [
    new CORSPlugin({
      origin: (origin) => origin,
      allowMethods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
    }),
    new ResponseHeadersPlugin(),
    new SimpleCsrfProtectionHandlerPlugin(),
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: { headers: request.headers },
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute("/api/$").methods({
  GET: ({ request }) => {
    return handle({ request });
  },
  POST: async ({ request }) => {
    const handledRequest = await handle({ request });

    return handledRequest;
  },
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
