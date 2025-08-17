import React from "react";
import { AlertTriangle, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  action: string;
  details: Record<string, any>;
  backupData: Record<string, any> | null;
  timestamp: string;
}

interface RestoreConfirmDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  auditLog: AuditLog | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const getRestoreDescription = (action: string, details: Record<string, any>): string => {
  switch (action) {
    case "deleteServerFile":
    case "deleteTemplateFile":
      return `This will recreate the deleted file "${details.file}" with its original content.`;
    case "writeServerFileContents":
    case "writeTemplateFileContents":
      return `This will revert the file "${details.file}" to its previous content.`;
    case "renameServerFile":
    case "renameTemplateFile":
      return `This will rename "${details.newPath}" back to "${details.oldPath}".`;
    default:
      return "This will restore the previous state of this resource.";
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const RestoreConfirmDialog: React.FC<RestoreConfirmDialogProps> = ({
  open,
  onOpenChange,
  auditLog,
  onConfirm,
  isLoading = false,
}) => {
  if (!auditLog) return null;

  const description = getRestoreDescription(auditLog.action, auditLog.details);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Restore Action
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{auditLog.action}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(auditLog.timestamp)}
              </span>
            </div>
            <p className="text-sm">{description}</p>
          </div>

          {auditLog.backupData?.originalContent && (
            <div>
              <h4 className="text-sm font-medium mb-2">Content Preview:</h4>
              <div className="p-2 bg-muted rounded text-xs overflow-auto max-h-32 font-mono">
                {typeof auditLog.backupData.originalContent === "string" 
                  ? auditLog.backupData.originalContent.substring(0, 500) + 
                    (auditLog.backupData.originalContent.length > 500 ? "..." : "")
                  : JSON.stringify(auditLog.backupData.originalContent, null, 2)}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                Warning
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                This action will overwrite the current state. Make sure you want to proceed as this cannot be easily undone.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Undo2 className="h-4 w-4" />
            {isLoading ? "Restoring..." : "Restore"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};