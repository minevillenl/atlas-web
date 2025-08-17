import { AuditService } from "./audit";

interface AuditContext {
  auditAction?: string;
  resourceType?: "server" | "group" | "template" | "file";
  resourceId?: string;
  captureBackup?: boolean;
}

export const auditMiddleware = async (
  { input, context }: { input: any; context: AuditContext },
  next: (_params: { input: any; context: AuditContext }) => Promise<any>
) => {
  const {
    auditAction,
    resourceType,
    resourceId,
    captureBackup = false,
  } = context;

  if (!auditAction || !resourceType || !resourceId) {
    return next({ input, context });
  }

  let backupData: Record<string, any> | undefined;

  // Capture backup data before executing the operation
  if (captureBackup && resourceType === "file") {
    try {
      if (auditAction.includes("Server")) {
        const serverId = input.server;
        const filePath = input.file || input.oldPath;
        if (serverId && filePath) {
          backupData = await AuditService.captureFileBackup(auditAction, serverId, filePath);
        }
      } else if (auditAction.includes("Template")) {
        const filePath = input.file || input.oldPath;
        if (filePath) {
          backupData = await AuditService.captureTemplateFileBackup(auditAction, filePath);
        }
      }
    } catch (error) {
      console.error("Failed to capture backup data:", error);
    }
  }

  try {
    const result = await next({ input, context });

    // Log successful operation
    await AuditService.logAction({
      action: auditAction,
      resourceType,
      resourceId,
      details: input,
      backupData,
      success: true,
    });

    return result;
  } catch (error) {
    // Log failed operation
    await AuditService.logAction({
      action: auditAction,
      resourceType,
      resourceId,
      details: input,
      backupData,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
};

