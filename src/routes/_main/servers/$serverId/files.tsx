import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Edit,
  File,
  FileText,
  Folder,
  HardDrive,
  Home,
  Image,
  Link,
  MoreVertical,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

const mockFiles = [
  {
    name: "server.properties",
    mode: "rw-r--r--",
    modeBits: 644,
    size: 1229,
    isFile: true,
    isSymlink: false,
    mimeType: "text/plain",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-18T10:30:15Z",
  },
  {
    name: "world",
    mode: "rwxr-xr-x",
    modeBits: 755,
    size: 2576980378,
    isFile: false,
    isSymlink: false,
    mimeType: "inode/directory",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-18T10:25:30Z",
  },
  {
    name: "plugins",
    mode: "rwxr-xr-x",
    modeBits: 755,
    size: 47841526,
    isFile: false,
    isSymlink: false,
    mimeType: "inode/directory",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-18T09:15:22Z",
  },
  {
    name: "logs",
    mode: "rwxr-xr-x",
    modeBits: 755,
    size: 134217728,
    isFile: false,
    isSymlink: false,
    mimeType: "inode/directory",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-18T10:32:10Z",
  },
  {
    name: "whitelist.json",
    mode: "rw-r--r--",
    modeBits: 644,
    size: 456,
    isFile: true,
    isSymlink: false,
    mimeType: "application/json",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-17T14:20:05Z",
  },
  {
    name: "banned-players.json",
    mode: "rw-r--r--",
    modeBits: 644,
    size: 0,
    isFile: true,
    isSymlink: false,
    mimeType: "application/json",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-15T12:00:00Z",
  },
  {
    name: "ops.json",
    mode: "rw-r--r--",
    modeBits: 644,
    size: 234,
    isFile: true,
    isSymlink: false,
    mimeType: "application/json",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-16T16:45:30Z",
  },
  {
    name: "server.jar",
    mode: "rwxr-xr-x",
    modeBits: 755,
    size: 48526374,
    isFile: true,
    isSymlink: false,
    mimeType: "application/java-archive",
    createdAt: "2025-01-10T08:00:00Z",
    modifiedAt: "2025-01-10T08:00:00Z",
  },
  {
    name: "latest.log",
    mode: "rw-r--r--",
    modeBits: 644,
    size: 0,
    isFile: false,
    isSymlink: true,
    mimeType: "text/plain",
    createdAt: "2025-01-18T10:32:10Z",
    modifiedAt: "2025-01-18T10:32:10Z",
  },
];

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (file: typeof mockFiles[0]) => {
  if (!file.isFile) return Folder;
  if (file.isSymlink) return Link;
  
  if (file.mimeType.startsWith("image/")) return Image;
  if (file.mimeType.includes("text") || file.mimeType.includes("json")) return FileText;
  return File;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const RouteComponent = () => {
  const { serverId } = Route.useParams();

  const { data: server } = useQuery({
    ...orpc.atlas.getServer.queryOptions({
      input: { server: serverId },
    }),
  });

  if (!server) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5" />
            File Manager
          </div>
          <Button size="sm" variant="outline" className="h-6 gap-2">
            <UploadIcon className="h-4 w-4" />
            Upload
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Path */}
        <div className="bg-muted/50 mb-4 rounded p-2 font-mono text-sm">
          /{server.workingDirectory}
        </div>

        {/* File List */}
        <div className="space-y-1">
          {mockFiles.map((file) => (
            <div
              key={file.name}
              className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                {file.type === "folder" ? (
                  <FolderIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileIcon className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {file.size} • Modified {file.modified}
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                {file.type === "file" && (
                  <>
                    <Button size="sm" variant="ghost" className="gap-2">
                      <EditIcon className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-2">
                      <DownloadIcon className="h-4 w-4" />
                      Download
                    </Button>
                  </>
                )}
                {file.type === "folder" && (
                  <Button size="sm" variant="ghost">
                    Open
                  </Button>
                )}
              </div>
            </div>
          ))}
          iNo
        </div>
      </CardContent>
    </Card>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/files")({
  component: RouteComponent,
});
