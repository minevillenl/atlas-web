import { ORPCError, os } from "@orpc/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import atlas from "@/server/lib/atlas-api/atlas-api.client";
import { auth } from "@/server/lib/auth";

const serverListInputSchema = z.object({
  group: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const serverList = os
  .input(serverListInputSchema)
  .handler(async ({ input }) => {
    const request = getWebRequest();

    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const servers = await atlas.getServers(input);
    return servers.data;
  });

const getServer = os
  .input(z.object({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const server = await atlas.getServer(input.server);
    return server.data;
  });

const getServerLogs = os
  .input(z.object({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const logs = await atlas.getServerLogs(input.server);
    return logs.data;
  });

const groupList = os.handler(async () => {
  const request = getWebRequest();

  const session = await auth.api.getSession({
    headers: request?.headers ?? new Headers(),
  });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const groups = await atlas.getGroups();
  return groups.data;
});

const getGroup = os
  .input(z.object({ group: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const group = await atlas.getGroup(input.group);
    return group.data;
  });

const scale = os
  .input(z.object({ group: z.string(), direction: z.enum(["up", "down"]) }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const group = await atlas.scaleGroup(input.group, {
      count: 1,
      direction: input.direction,
    });

    return group.data;
  });

const serverCount = os.handler(async () => {
  const request = getWebRequest();

  const session = await auth.api.getSession({
    headers: request?.headers ?? new Headers(),
  });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const servers = await atlas.getServerCount();
  console.log(servers);
  return servers.data;
});

const playerCount = os.handler(async () => {
  const request = getWebRequest();

  const session = await auth.api.getSession({
    headers: request?.headers ?? new Headers(),
  });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const players = await atlas.getPlayerCount();
  return players.data;
});

const utilization = os.handler(async () => {
  const request = getWebRequest();

  const session = await auth.api.getSession({
    headers: request?.headers ?? new Headers(),
  });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const utilization = await atlas.getUtilization();
  return utilization.data;
});

export default {
  serverList,
  getServer,
  groupList,
  getGroup,
  serverCount,
  playerCount,
  utilization,
  getServerLogs,
  scale,
};
