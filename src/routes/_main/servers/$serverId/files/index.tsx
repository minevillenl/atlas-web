import React, { useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { FilePlus, FolderIcon, FolderPlus, UploadIcon } from "lucide-react";

import {
  FileCreateDialog,
  type FileCreateDialogRef,
} from "@/components/files/file-create-dialog";
import {
  FileDeleteDialog,
  type FileDeleteDialogRef,
} from "@/components/files/file-delete-dialog";
import {
  FileMoveDialog,
  type FileMoveDialogRef,
} from "@/components/files/file-move-dialog";
import {
  FileRenameDialog,
  type FileRenameDialogRef,
} from "@/components/files/file-rename-dialog";
import { FileTable } from "@/components/files/file-table";
import {
  FileUploadDialog,
  type FileUploadDialogRef,
} from "@/components/files/file-upload-dialog";
import { UploadProgressIndicator } from "@/components/files/upload-progress-indicator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useServerCreateFolderMutation } from "@/hooks/mutations/use-server-create-folder-mutation";
import { useServerUploadFileMutation } from "@/hooks/mutations/use-server-upload-file-mutation";
import { orpc } from "@/lib/orpc";
import { FileItem } from "@/server/lib/atlas-api/atlas-api.schemas";

const sortFiles = (files: FileItem[]) => {
  return [...files].sort((a, b) => {
    const aIsFolder = !a.file && !a.symlink;
    const bIsFolder = !b.file && !b.symlink;

    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;

    return a.name.localeCompare(b.name);
  });
};

const generateBreadcrumbItems = (currentPath: string | undefined) => {
  if (!currentPath || currentPath === "/") {
    return [{ name: "container", path: "/" }];
  }

  const pathParts = currentPath.split("/").filter(Boolean);
  const items = [{ name: "container", path: "/" }];

  let accumulatedPath = "";
  for (const part of pathParts) {
    accumulatedPath += `/${part}`;
    items.push({ name: part, path: accumulatedPath });
  }

  return items;
};

const RouteComponent = () => {
  const { serverId } = Route.useParams();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_main/servers/$serverId/files/" });

  const createDialogRef = useRef<FileCreateDialogRef>(null);
  const deleteDialogRef = useRef<FileDeleteDialogRef>(null);
  const renameDialogRef = useRef<FileRenameDialogRef>(null);
  const moveDialogRef = useRef<FileMoveDialogRef>(null);
  const uploadDialogRef = useRef<FileUploadDialogRef>(null);

  const currentPath = search.path;

  const createFolderMutation = useServerCreateFolderMutation(serverId);
  const uploadFileMutation = useServerUploadFileMutation(serverId);

  const { data: server } = useQuery({
    ...orpc.atlas.getServer.queryOptions({
      input: { server: serverId },
    }),
  });

  const {
    data: files,
    isLoading,
    error,
  } = useQuery({
    ...orpc.atlas.getServerFiles.queryOptions({
      input: { server: serverId, path: currentPath || "/" },
    }),
  });

  const navigateToPath = (path: string) => {
    navigate({
      to: ".",
      search: { path },
    });
  };

  const handleDeleteFile = (file: FileItem) => {
    deleteDialogRef.current?.openDialog(file);
  };

  const handleRenameFile = (file: FileItem) => {
    renameDialogRef.current?.openDialog(file);
  };

  const handleMoveFile = (file: FileItem) => {
    moveDialogRef.current?.openDialog(file);
  };

  const handleEditFile = (file: FileItem) => {
    const filePath =
      currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;

    navigate({
      to: `/servers/${serverId}/files/edit`,
      search: { path: filePath },
    });
  };

  const handleCreateFile = () => {
    navigate({
      to: `/servers/${serverId}/files/new`,
      search: { path: currentPath },
    });
  };

  const handleCreateFolder = (folderName: string) => {
    const folderPath =
      currentPath === "/"
        ? `/${folderName}`
        : `${currentPath}/${folderName}`;

    createFolderMutation.mutate({
      server: serverId,
      path: folderPath,
    });
  };

  const handleUploadFiles = (files: File[]) => {
    files.forEach((file) => {
      const filePath =
        currentPath === "/"
          ? `/${file.name}`
          : `${currentPath}/${file.name}`;

      uploadFileMutation.mutate({
        server: serverId,
        path: filePath,
        file: file,
      });
    });
  };

  if (!server) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderIcon className="text-foreground h-5 w-5" />
            <span className="text-lg font-medium">File Manager</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-md px-4 py-2 font-mono text-sm">
          <Breadcrumb>
            <BreadcrumbList className="text-muted-foreground !gap-0 flex-wrap items-center text-sm break-words">
              <BreadcrumbItem className="!gap-0 inline-flex items-center">
                <span>/home/</span>
              </BreadcrumbItem>
              {generateBreadcrumbItems(currentPath).map((item, index, array) => (
                <React.Fragment key={item.path}>
                  {index === array.length - 1 ? (
                    <BreadcrumbItem className="!gap-0 inline-flex items-center">
                      <BreadcrumbPage className="text-foreground font-mono">
                        {item.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <BreadcrumbItem className="!gap-0 inline-flex items-center">
                      <BreadcrumbLink
                        className="cursor-pointer hover:text-foreground font-mono"
                        onClick={() => navigateToPath(item.path)}
                      >
                        {item.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                  {index < array.length - 1 && (
                    <BreadcrumbSeparator>
                      <span>/</span>
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="text-destructive">
            <FolderIcon className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">Failed to load files</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {error.message ||
                "An error occurred while fetching the file list"}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const filesWithBack =
    currentPath !== "/"
      ? [
          {
            name: "..",
            mode: "rwxr-xr-x",
            modeBits: 755,
            mimeType: "inode/directory",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            file: false,
            symlink: false,
          },
          ...(files?.files || []),
        ]
      : files?.files || [];

  const sortedFiles = sortFiles(filesWithBack);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderIcon className="text-foreground h-5 w-5" />
          <span className="text-lg font-medium">File Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCreateFile}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            New File
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createDialogRef.current?.openFolderDialog()}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => uploadDialogRef.current?.openDialog()}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 rounded-md px-4 py-2 font-mono text-sm">
        <Breadcrumb>
          <BreadcrumbList className="text-muted-foreground !gap-0 flex-wrap items-center text-sm break-words">
            <BreadcrumbItem className="!gap-0 inline-flex items-center">
              <span>/home/</span>
            </BreadcrumbItem>
            {generateBreadcrumbItems(currentPath).map((item, index, array) => (
              <React.Fragment key={item.path}>
                {index === array.length - 1 ? (
                  <BreadcrumbItem className="!gap-0 inline-flex items-center">
                    <BreadcrumbPage className="text-foreground font-mono">
                      {item.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbItem className="!gap-0 inline-flex items-center">
                    <BreadcrumbLink
                      className="cursor-pointer hover:text-foreground font-mono"
                      onClick={() => navigateToPath(item.path)}
                    >
                      {item.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
                {index < array.length - 1 && (
                  <BreadcrumbSeparator>
                    <span>/</span>
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <FileTable
        files={sortedFiles}
        isLoading={isLoading}
        serverId={serverId}
        currentPath={currentPath}
        onNavigateToPath={navigateToPath}
        onEditFile={handleEditFile}
        onRenameFile={handleRenameFile}
        onMoveFile={handleMoveFile}
        onDeleteFile={handleDeleteFile}
        onUploadFiles={handleUploadFiles}
      />

      <FileDeleteDialog
        ref={deleteDialogRef}
        serverId={serverId}
        currentPath={currentPath}
      />

      <FileRenameDialog
        ref={renameDialogRef}
        serverId={serverId}
        currentPath={currentPath}
      />

      <FileMoveDialog
        ref={moveDialogRef}
        serverId={serverId}
        currentPath={currentPath}
      />

      <FileCreateDialog
        ref={createDialogRef}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
      />

      <FileUploadDialog
        ref={uploadDialogRef}
        serverId={serverId}
        currentPath={currentPath}
      />

      <UploadProgressIndicator />
    </div>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/files/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      path: (search.path as string) || "/",
    };
  },
});
