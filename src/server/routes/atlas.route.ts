import { ORPCError, os } from "@orpc/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import atlas from "@/server/lib/atlas-api/atlas-api.client";
import { auth } from "@/server/lib/auth";
import { env } from "@/env";

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

const getServerFiles = os
  .input(z.object({ server: z.string(), path: z.string().optional() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const files = await atlas.getServerFiles(input.server, input.path);
    return files.data;
  });

const getServerFileContents = os
  .input(z.object({ server: z.string(), file: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const fileContents = await atlas.getServerFileContents(
      input.server,
      input.file
    );
    return fileContents;
  });

const writeServerFileContents = os
  .input(
    z.object({ server: z.string(), file: z.string(), content: z.string() })
  )
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.writeServerFileContents(
      input.server,
      input.file,
      input.content
    );
    return result;
  });

const deleteServerFile = os
  .input(z.object({ server: z.string(), file: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.deleteServerFile(input.server, input.file);
    return result;
  });

const renameServerFile = os
  .input(
    z.object({ server: z.string(), oldPath: z.string(), newPath: z.string() })
  )
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.renameServerFile(input.server, {
      oldPath: input.oldPath,
      newPath: input.newPath,
    });

    return result;
  });

const moveServerFile = os
  .input(
    z.object({ server: z.string(), file: z.string(), newPath: z.string() })
  )
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.renameServerFile(input.server, {
      oldPath: input.file,
      newPath: input.newPath,
    });

    return result;
  });

const downloadServerFile = os
  .input(z.object({ server: z.string(), file: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.downloadServerFile(input.server, input.file);
    return result;
  });

const createServerFolder = os
  .input(z.object({ server: z.string(), path: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.createServerFolder(input.server, input.path);
    return result;
  });

const uploadServerFile = os
  .input(
    z.object({ server: z.string(), path: z.string(), file: z.instanceof(File) })
  )
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.uploadServerFile(
      input.server,
      input.path,
      input.file
    );
    return result;
  });

const executeServerCommand = os
  .input(z.object({ server: z.string(), command: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.executeServerCommand(input.server, {
      command: input.command,
    });
    return result.data;
  });

const getWebSocketToken = os
  .input(z.object({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    // Generate WebSocket token via Atlas API
    const tokenResponse = await atlas.generateWebSocketToken(input.server);

    if (!tokenResponse.data) {
      throw new ORPCError("INTERNAL_ERROR", { message: "Failed to generate WebSocket token" });
    }

    return {
      token: tokenResponse.data.token,
      expiresAt: tokenResponse.data.expiresAt,
      wsUrl: `${env.ATLAS_API_URL.replace(/^http/, "ws")}/api/v1/servers/${input.server}/ws`,
    };
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
  getServerFiles,
  getServerFileContents,
  writeServerFileContents,
  deleteServerFile,
  renameServerFile,
  moveServerFile,
  downloadServerFile,
  createServerFolder,
  uploadServerFile,
  executeServerCommand,
  getWebSocketToken,
};
