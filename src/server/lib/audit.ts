import { nanoid } from "nanoid";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq, and, isNull } from "drizzle-orm";

import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { auth } from "@/server/lib/auth";
import atlas from "@/server/lib/atlas-api/atlas-api.client";

export interface AuditLogEntry {
  action: string;
  resourceType: "server" | "group" | "template" | "file";
  resourceId: string;
  details: Record<string, any>;
  backupData?: Record<string, any>;
  restorePossible?: boolean;
  success: boolean;
  errorMessage?: string;
}

export interface RestorableAction {
  deleteServerFile: boolean;
  deleteTemplateFile: boolean;
  writeServerFileContents: boolean;
  writeTemplateFileContents: boolean;
  renameServerFile: boolean;
  renameTemplateFile: boolean;
}

const RESTORABLE_ACTIONS: Record<string, boolean> = {
  deleteServerFile: true,
  deleteTemplateFile: true,
  writeServerFileContents: true,
  writeTemplateFileContents: true,
  renameServerFile: true,
  renameTemplateFile: true,
};

export class AuditService {
  private static isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
  private static async getCurrentUser() {
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request?.headers ?? new Headers(),
    });
    return session?.user;
  }

  private static getClientInfo() {
    const request = getWebRequest();
    const headers = request?.headers ?? new Headers();
    
    return {
      ipAddress: headers.get("x-forwarded-for") || headers.get("x-real-ip") || "unknown",
      userAgent: headers.get("user-agent") || "unknown",
    };
  }

  static async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      const { ipAddress, userAgent } = this.getClientInfo();
      
      // STRICT RULE: 
      // - Dynamic servers: Store ID
      // - Static servers: Store NAME
      let finalResourceId = entry.resourceId;
      let enrichedDetails = { ...entry.details };
      
      // For ALL server-related operations (including files on servers)
      if ((entry.resourceType === "server" || entry.resourceType === "file") && entry.details?.server) {
        try {
          const serverData = await atlas.getServer(entry.details.server);
          if (serverData.data) {
            // Check if server is static or dynamic based on server type
            const isStatic = serverData.data.type !== "DYNAMIC";
            
            // Store both ID and name in details for display purposes
            enrichedDetails = {
              ...enrichedDetails,
              serverId: serverData.data.serverId,
              serverName: serverData.data.name,
              serverType: isStatic ? "static" : "dynamic"
            };
            
            if (isStatic) {
              // STATIC server: Use NAME in resourceId
              finalResourceId = serverData.data.name;
            } else {
              // DYNAMIC server: Use serverId in resourceId
              finalResourceId = serverData.data.serverId;
            }
          }
        } catch (error) {
          console.warn("Could not fetch server data for audit log, using provided value:", error);
          // Fallback to original resourceId if fetch fails
        }
      }
      
      await db.insert(auditLogs).values({
        id: nanoid(),
        userId: user.id,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: finalResourceId,
        details: JSON.stringify(enrichedDetails),
        backupData: entry.backupData ? JSON.stringify(entry.backupData) : null,
        restorePossible: entry.restorePossible ?? RESTORABLE_ACTIONS[entry.action] ?? false,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success: entry.success,
        errorMessage: entry.errorMessage,
      });
    } catch (error) {
      console.error("Failed to log audit entry:", error);
    }
  }

  static async captureFileBackup(action: string, serverId: string, filePath: string): Promise<Record<string, any> | undefined> {
    if (!RESTORABLE_ACTIONS[action]) return undefined;

    try {
      if (action === "writeServerFileContents") {
        const content = await atlas.getServerFileContents(serverId, filePath);
        return { originalContent: content, filePath };
      } else if (action === "deleteServerFile") {
        const content = await atlas.getServerFileContents(serverId, filePath);
        return { originalContent: content, filePath };
      } else if (action === "renameServerFile") {
        return { originalPath: filePath };
      }
    } catch (error) {
      console.error("Failed to capture file backup:", error);
    }
    
    return undefined;
  }

  static async captureTemplateFileBackup(action: string, filePath: string): Promise<Record<string, any> | undefined> {
    if (!RESTORABLE_ACTIONS[action]) return undefined;

    try {
      if (action === "writeTemplateFileContents") {
        const content = await atlas.getTemplateFileContents(filePath);
        return { originalContent: content, filePath };
      } else if (action === "deleteTemplateFile") {
        const content = await atlas.getTemplateFileContents(filePath);
        return { originalContent: content, filePath };
      } else if (action === "renameTemplateFile") {
        return { originalPath: filePath };
      }
    } catch (error) {
      console.error("Failed to capture template file backup:", error);
    }
    
    return undefined;
  }

  private static async getServerIdFromName(serverName: string): Promise<string> {
    try {
      // Get the list of servers and find one with matching name
      const servers = await atlas.getServers();
      const server = servers.data.find(s => s.name === serverName);
      if (!server) {
        throw new Error(`Server with name "${serverName}" not found`);
      }
      return server.serverId;
    } catch (error) {
      console.error("Failed to get server ID from name:", error);
      throw new Error(`Could not resolve server name "${serverName}" to server ID`);
    }
  }

  static async restoreAction(auditLogId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, message: "Unauthorized" };
      }

      const auditLog = await db.select().from(auditLogs).where(
        and(
          eq(auditLogs.id, auditLogId),
          eq(auditLogs.restorePossible, true),
          isNull(auditLogs.restoredAt)
        )
      ).limit(1).then(rows => rows[0]);

      if (!auditLog) {
        return { success: false, message: "Audit log not found or not restorable" };
      }

      const backupData = auditLog.backupData ? JSON.parse(auditLog.backupData) : null;
      if (!backupData) {
        return { success: false, message: "No backup data available" };
      }

      switch (auditLog.action) {
        case "deleteServerFile":
          // resourceId contains either serverName:filePath or serverId:filePath
          const serverIdentifierForDelete = auditLog.resourceId.split(":")[0];
          const serverIdForDelete = this.isUUID(serverIdentifierForDelete) 
            ? serverIdentifierForDelete 
            : await this.getServerIdFromName(serverIdentifierForDelete);
          await atlas.writeServerFileContents(
            serverIdForDelete,
            backupData.filePath,
            backupData.originalContent
          );
          break;

        case "deleteTemplateFile":
          await atlas.writeTemplateFileContents(
            backupData.filePath,
            backupData.originalContent
          );
          break;

        case "writeServerFileContents":
          // resourceId contains either serverName:filePath or serverId:filePath
          const serverIdentifierForWrite = auditLog.resourceId.split(":")[0];
          const serverIdForWrite = this.isUUID(serverIdentifierForWrite) 
            ? serverIdentifierForWrite 
            : await this.getServerIdFromName(serverIdentifierForWrite);
          
          // Get file path from backup data (new format) or resourceId (old format)
          const filePathForRestore = backupData.filePath || auditLog.resourceId.split(":")[1];
          if (!filePathForRestore) {
            throw new Error("File path not found in backup data or resourceId");
          }
          
          await atlas.writeServerFileContents(
            serverIdForWrite,
            filePathForRestore,
            backupData.originalContent
          );
          break;

        case "writeTemplateFileContents":
          // Get file path from backup data (new format) or resourceId (old format)
          const templateFilePathForRestore = backupData.filePath || auditLog.resourceId;
          await atlas.writeTemplateFileContents(
            templateFilePathForRestore,
            backupData.originalContent
          );
          break;

        case "renameServerFile":
          const details = JSON.parse(auditLog.details);
          // For rename operations, resourceId is just the server ID/name
          const serverIdForRename = this.isUUID(auditLog.resourceId) 
            ? auditLog.resourceId 
            : await this.getServerIdFromName(auditLog.resourceId);
          await atlas.renameServerFile(
            serverIdForRename,
            {
              oldPath: details.newPath,
              newPath: backupData.originalPath,
            }
          );
          break;

        case "renameTemplateFile":
          const templateDetails = JSON.parse(auditLog.details);
          await atlas.renameTemplateFile({
            oldPath: templateDetails.newPath,
            newPath: backupData.originalPath,
          });
          break;

        default:
          return { success: false, message: "Unsupported restore action" };
      }

      // Mark as restored
      await db.update(auditLogs)
        .set({
          restoredAt: new Date(),
          restoredBy: user.id,
        })
        .where(eq(auditLogs.id, auditLogId));

      // Log the restore action itself
      await this.logAction({
        action: `restore_${auditLog.action}`,
        resourceType: auditLog.resourceType as any,
        resourceId: auditLog.resourceId,
        details: { originalAuditLogId: auditLogId },
        restorePossible: false,
        success: true,
      });

      return { success: true, message: "Action restored successfully" };
    } catch (error) {
      console.error("Failed to restore action:", error);
      return { success: false, message: error instanceof Error ? error.message : "Restore failed" };
    }
  }
}