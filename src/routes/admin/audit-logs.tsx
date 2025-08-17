import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Search, 
  Undo2,
  Server,
  File,
  History,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/lib/orpc";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  backupData: any;
  restorePossible: boolean;
  restoredAt: Date | null;
  restoredBy: string | null;
  timestamp: Date;
  success: boolean;
  errorMessage: string | null;
  userName: string | null;
  userEmail: string | null;
}


const getActionDescription = (action: string, details: Record<string, any>, resourceId?: string): string => {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  
  const getServerIdentifier = () => {
    if (details.serverType && details.serverName && details.serverId) {
      return `${capitalize(details.serverName)} (${details.serverId})`;
    }
    
    if (resourceId) {
      const looksLikeId = resourceId.includes("-") && resourceId.match(/^[a-zA-Z]+-\d+$/);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resourceId);
      
      if (looksLikeId || isUuid) {
        return `a server (${resourceId})`;
      } else {
        return capitalize(resourceId);
      }
    }
    
    return "unknown server";
  };
  
  switch (action) {
    case "deleteServerFile":
      return `Deleted file: ${details.file} on ${getServerIdentifier()}`;
    case "deleteTemplateFile":
      return `Deleted template file: ${details.file}`;
    case "writeServerFileContents":
      return `Modified file: ${details.file} on ${getServerIdentifier()}`;
    case "writeTemplateFileContents":
      return `Modified template file: ${details.file}`;
    case "renameServerFile":
      return `Renamed "${details.oldPath}" to "${details.newPath}" on ${getServerIdentifier()}`;
    case "renameTemplateFile":
      return `Renamed template "${details.oldPath}" to "${details.newPath}"`;
    case "startServer":
      return `Started server: ${getServerIdentifier()}`;
    case "stopServer":
      return `Stopped server: ${getServerIdentifier()}`;
    case "restartServer":
      return `Restarted server: ${getServerIdentifier()}`;
    case "scale":
      return `Scaled ${details.direction}: ${capitalize(details.group)}`;
    case "createServerFolder":
      return `Created folder: ${details.path} on ${getServerIdentifier()}`;
    case "createTemplateFolder":
      return `Created template folder: ${details.path}`;
    case "uploadServerFile":
      return `Uploaded file to: ${details.path} on ${getServerIdentifier()}`;
    case "getServerFileContents":
      return `Viewed file: ${details.file} on ${getServerIdentifier()}`;
    case "getTemplateFileContents":
      return `Viewed template file: ${details.file}`;
    case "executeServerCommand":
      return `Executed command: ${details.command} on ${getServerIdentifier()}`;
    case "zipServerFiles":
      return `Created archive in: ${details.path || "server"} on ${getServerIdentifier()}`;
    case "zipTemplateFiles":
      return `Created template archive in: ${details.path || "templates"}`;
    case "unzipServerFile":
      return `Extracted archive: ${details.file} on ${getServerIdentifier()}`;
    case "unzipTemplateFile":
      return `Extracted template archive: ${details.file}`;
    default:
      return capitalize(action.replace(/([A-Z])/g, " $1").trim());
  }
};

const getResourceIcon = (resourceType: string) => {
  switch (resourceType) {
    case "server":
      return <Server className="h-4 w-4" />;
    case "file":
      return <File className="h-4 w-4" />;
    case "group":
      return <Server className="h-4 w-4" />;
    case "template":
      return <File className="h-4 w-4" />;
    default:
      return <History className="h-4 w-4" />;
  }
};

interface AuditLogsViewProps {
  mode?: "global" | "server" | "group";
  resourceId?: string;
  resourceName?: string;
  isStatic?: boolean;
  compact?: boolean;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ 
  mode = "global", 
  resourceId, 
  resourceName,
  isStatic,
  compact = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchMode, setSearchMode] = useState<"id" | "name" | "both">(
    isStatic ? "name" : "id"
  );
  const [page, setPage] = useState(1);
  const pageSize = compact ? 10 : 20;

  const getQueryOptions = () => {
    if (mode === "server" && (resourceId || resourceName)) {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        search: searchQuery || undefined,
        actionType: actionFilter === "all" ? undefined : actionFilter as any,
      };
      
      if (searchMode === "both" && resourceId && resourceName) {
        params.serverId = resourceId;
        params.serverName = resourceName;
      } else if (searchMode === "name" && resourceName) {
        params.serverName = resourceName;
      } else if (searchMode === "id" && resourceId) {
        params.serverId = resourceId;
      }
      
      return orpc.atlas.getServerAuditHistory.queryOptions({ input: params });
    } else if (mode === "group" && resourceId) {
      return orpc.atlas.getGroupAuditHistory.queryOptions({
        input: {
          groupId: resourceId,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          search: searchQuery || undefined,
          actionType: actionFilter === "all" ? undefined : actionFilter as any,
        }
      });
    } else {
      return orpc.atlas.getAllAuditLogs.queryOptions({
        input: {
          limit: pageSize,
          offset: (page - 1) * pageSize,
          resourceType: resourceTypeFilter === "all" ? undefined : resourceTypeFilter as any,
          search: searchQuery || undefined,
          actionType: actionFilter === "all" ? undefined : actionFilter as any,
        }
      });
    }
  };

  const { data: auditLogs, isLoading, refetch } = useQuery({
    ...getQueryOptions(),
    queryKey: ["audit-logs", mode, resourceId, resourceName, searchMode, page, searchQuery, resourceTypeFilter, actionFilter],
  });

  const restoreMutation = useMutation(
    orpc.atlas.restoreAction.mutationOptions({
      onSuccess: async () => {
        toast.success("Action restored successfully");
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to restore: ${error.message}`);
      },
    })
  );


  const formatTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const then = typeof date === "string" ? new Date(date) : date;
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {!compact && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "server" ? "Server Activity" : mode === "group" ? "Group Activity" : "Activity Log"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "server" ? "Track all actions on this server" : 
             mode === "group" ? "Track all actions in this group" : 
             "Track all system actions and user activities"}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          {mode === "server" && resourceId && resourceName && (
            <Select value={searchMode} onValueChange={(value: "id" | "name" | "both") => setSearchMode(value)}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">By ID ({resourceId})</SelectItem>
                <SelectItem value="name">By Name ({resourceName})</SelectItem>
                <SelectItem value="both">Both ID & Name</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {mode === "global" && (
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="server">Servers</SelectItem>
                <SelectItem value="group">Groups</SelectItem>
                <SelectItem value="file">Files</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-0 border rounded-lg bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                </div>
                <div className="h-3 bg-muted rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        ) : auditLogs?.logs?.length === 0 ? (
          <div className="p-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No activities found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="divide-y">
            {auditLogs?.logs?.map((log: AuditLog) => (
              <div key={log.id} className="group p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      log.success 
                        ? "bg-green-50 text-green-600 border border-green-200" 
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}>
                      {getResourceIcon(log.resourceType)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      log.success ? "bg-green-500" : "bg-red-500"
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-6">
                          {getActionDescription(log.action, log.details, log.resourceId)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {log.userName ? log.userName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {log.userName || log.userEmail || `User ${log.userId.slice(0, 8)}...`}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">•</div>
                          <Badge variant="outline" className="text-xs py-0 px-1.5">
                            {log.resourceType}
                          </Badge>
                          <div className="text-xs text-muted-foreground">•</div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(log.timestamp)}
                          </span>
                        </div>
                        {log.errorMessage && (
                          <div className="text-xs text-red-600 flex items-center gap-1.5 mt-2 p-2 bg-red-50 rounded-md border border-red-200">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            <span>{log.errorMessage}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {log.restoredAt && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                            Restored
                          </Badge>
                        )}
                        {log.restorePossible && !log.restoredAt && log.success && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            onClick={() => restoreMutation.mutateAsync({ auditLogId: log.id })}
                            disabled={restoreMutation.isPending}
                          >
                            <Undo2 className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {auditLogs && auditLogs.total > pageSize && (
          <div className="border-t px-4 py-3 flex items-center justify-between bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, auditLogs.total)} of {auditLogs.total} activities
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-2 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= auditLogs.total}
                className="h-7 px-2 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RouteComponent = () => {
  return <AuditLogsView mode="global" />;
};

export const Route = createFileRoute("/admin/audit-logs")({
  component: RouteComponent,
});