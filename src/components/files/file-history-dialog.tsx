import React, { useState } from "react";
import { History, Undo2, User, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  backupData: Record<string, any> | null;
  restorePossible: boolean;
  restoredAt: Date | null;
  restoredBy: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  success: boolean;
  errorMessage: string | null;
}

interface FileHistoryDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  resourceType: "server" | "group" | "template" | "file";
  resourceId: string;
  serverId?: string;
  isTemplate?: boolean;
}

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString();
};

const getActionDescription = (action: string, details: Record<string, any>): string => {
  switch (action) {
    case "deleteServerFile":
    case "deleteTemplateFile":
      return `Deleted file: ${details.file}`;
    case "writeServerFileContents":
    case "writeTemplateFileContents":
      return `Modified file: ${details.file}`;
    case "renameServerFile":
    case "renameTemplateFile":
      return `Renamed from "${details.oldPath}" to "${details.newPath}"`;
    case "createServerFolder":
    case "createTemplateFolder":
      return `Created folder: ${details.path}`;
    case "uploadServerFile":
      return `Uploaded file to: ${details.path}`;
    case "moveServerFile":
      return `Moved file to: ${details.newPath}`;
    case "zipServerFiles":
    case "zipTemplateFiles":
      return `Created archive: ${details.zipName || "files.zip"}`;
    case "unzipServerFile":
    case "unzipTemplateFile":
      return `Extracted archive: ${details.file}`;
    default:
      return action;
  }
};

export const FileHistoryDialog: React.FC<FileHistoryDialogProps> = ({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  serverId: _serverId,
  isTemplate: _isTemplate = false,
}) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const { data: auditHistory, isLoading } = useQuery({
    ...orpc.atlas.getAuditHistory.queryOptions({
      input: {
        resourceType,
        resourceId,
        limit: 50,
        offset: 0,
      }
    }),
    enabled: open,
  });

  const restoreMutation = useMutation({
    ...orpc.atlas.restoreAction.mutationOptions(),
    onSuccess: () => {
      toast.success("Action restored successfully");
      setSelectedLogId(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to restore: ${error.message}`);
    },
  });

  const handleRestore = async (auditLogId: string) => {
    setSelectedLogId(auditLogId);
    await restoreMutation.mutateAsync({ auditLogId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            File History
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-3 w-48 mb-1" />
                  <Skeleton className="h-3 w-36" />
                </div>
              ))}
            </div>
          ) : auditHistory?.logs?.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No History Available</h3>
              <p className="text-muted-foreground">
                No audit logs found for this resource.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditHistory?.logs?.map((log: AuditLog) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    log.success ? "border-border" : "border-destructive/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">
                        {getActionDescription(log.action, log.details)}
                      </span>
                      {log.restorePossible && !log.restoredAt && (
                        <Badge variant="secondary" className="text-xs">
                          Restorable
                        </Badge>
                      )}
                      {log.restoredAt && (
                        <Badge variant="outline" className="text-xs">
                          Restored
                        </Badge>
                      )}
                    </div>

                    {log.restorePossible && !log.restoredAt && log.success && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(log.id)}
                        disabled={restoreMutation.isPending && selectedLogId === log.id}
                        className="flex items-center gap-1"
                      >
                        <Undo2 className="h-3 w-3" />
                        {restoreMutation.isPending && selectedLogId === log.id
                          ? "Restoring..."
                          : "Restore"}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      User ID: {log.userId}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.timestamp)}
                    </div>
                  </div>

                  {log.errorMessage && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                      Error: {log.errorMessage}
                    </div>
                  )}

                  {log.restoredAt && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <span className="text-muted-foreground">
                        Restored on {formatDate(log.restoredAt)}
                        {log.restoredBy && ` by user ${log.restoredBy}`}
                      </span>
                    </div>
                  )}

                  {/* Show backup data preview for file operations */}
                  {log.backupData && (
                    <details className="mt-2">
                      <summary className="text-sm text-muted-foreground cursor-pointer">
                        View backup data
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(log.backupData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};