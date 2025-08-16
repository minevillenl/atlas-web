import { ORPCError, os } from "@orpc/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { env } from "@/env";
import atlas from "@/server/lib/atlas-api/atlas-api.client";
import { auth } from "@/server/lib/auth";
import {
  UnzipFileRequestSchema,
  ZipFilesRequestSchema,
} from "@/server/lib/atlas-api/atlas-api.schemas";

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
  .input(z.object({ server: z.string(), lines: z.number().optional() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const logs = await atlas.getServerLogs(input.server, input.lines);
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

const startServer = os
  .input(z.object({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.startServer(input.server);
    return result.data;
  });

const stopServer = os
  .input(z.object({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.stopServer(input.server);
    return result.data;
  });

const restartServer = os
  .input(z.object({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.restartServer(input.server);
    return result.data;
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
      throw new ORPCError("INTERNAL_ERROR", {
        message: "Failed to generate WebSocket token",
      });
    }

    return {
      token: tokenResponse.data.token,
      expiresAt: tokenResponse.data.expiresAt,
      wsUrl: `${env.ATLAS_API_URL.replace(/^http/, "ws")}/api/v1/servers/${input.server}/ws`,
    };
  });

const activityFiltersInputSchema = z.object({
  limit: z.number().min(1).max(200).optional(),
  offset: z.number().min(0).optional(),
});

const getRecentActivities = os
  .input(activityFiltersInputSchema)
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const activities = await atlas.getRecentActivities(input);
    return activities;
  });

const getServerActivities = os
  .input(activityFiltersInputSchema.extend({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const { server, ...filters } = input;
    const activities = await atlas.getServerActivities(server, filters);
    return activities;
  });

const getGroupActivities = os
  .input(activityFiltersInputSchema.extend({ group: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const { group, ...filters } = input;
    const activities = await atlas.getGroupActivities(group, filters);
    return activities;
  });

const zipServerFiles = os
  .input(ZipFilesRequestSchema.extend({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const { server, ...zipData } = input;
    const result = await atlas.zipServerFiles(server, zipData);
    return result;
  });

const unzipServerFile = os
  .input(UnzipFileRequestSchema.extend({ server: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const { server, ...unzipData } = input;
    const result = await atlas.unzipServerFile(server, unzipData);
    return result;
  });

// Template File Management
const getTemplateFiles = os
  .input(z.object({ path: z.string().optional() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const files = await atlas.getTemplateFiles(input.path);
    return files.data;
  });

const getTemplateFileContents = os
  .input(z.object({ file: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const fileContents = await atlas.getTemplateFileContents(input.file);
    return fileContents;
  });

const writeTemplateFileContents = os
  .input(z.object({ file: z.string(), content: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.writeTemplateFileContents(input.file, input.content);
    return result;
  });

const deleteTemplateFile = os
  .input(z.object({ file: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.deleteTemplateFile(input.file);
    return result;
  });

const renameTemplateFile = os
  .input(z.object({ oldPath: z.string(), newPath: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.renameTemplateFile(input);
    return result;
  });

const createTemplateFolder = os
  .input(z.object({ path: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.createTemplateFolder(input.path);
    return result;
  });


const downloadTemplateFile = os
  .input(z.object({ file: z.string() }))
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.downloadTemplateFile(input.file);
    return result;
  });

const zipTemplateFiles = os
  .input(ZipFilesRequestSchema)
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.zipTemplateFiles(input);
    return result;
  });

const unzipTemplateFile = os
  .input(UnzipFileRequestSchema)
  .handler(async ({ input }) => {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    const result = await atlas.unzipTemplateFile(input);
    return result;
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
  startServer,
  stopServer,
  restartServer,
  getServerFiles,
  getServerFileContents,
  writeServerFileContents,
  deleteServerFile,
  renameServerFile,
  moveServerFile,
  downloadServerFile,
  createServerFolder,
  uploadServerFile,
  zipServerFiles,
  unzipServerFile,
  executeServerCommand,
  getWebSocketToken,
  getRecentActivities,
  getServerActivities,
  getGroupActivities,
  // Template File Management
  getTemplateFiles,
  getTemplateFileContents,
  writeTemplateFileContents,
  deleteTemplateFile,
  renameTemplateFile,
  createTemplateFolder,
  downloadTemplateFile,
  zipTemplateFiles,
  unzipTemplateFile,
};
