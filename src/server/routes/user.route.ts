import { ORPCError, os } from "@orpc/server";
import { getWebRequest } from "@tanstack/react-start/server";

import { auth } from "@/server/lib/auth";

const me = os.handler(async () => {
  const request = getWebRequest();

  const session = await auth.api.getSession({
    headers: request?.headers ?? new Headers(),
  });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  return session;
});

export default {
  me,
};
