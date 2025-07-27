import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServerDownloadFileMutation } from "@/hooks/mutations/use-server-download-file-mutation";
import { useTemplateDownloadFileMutation } from "@/hooks/mutations/use-template-download-file-mutation";
import { isFileEditableByNameAndType } from "@/lib/utils";
import { FileItem } from "@/server/lib/atlas-api/atlas-api.schemas";

interface FileActionsDropdownProps {
  file: FileItem;
  serverId?: string;
  currentPath: string;
  onEdit: (_file: FileItem) => void;
  onRename: (_file: FileItem) => void;
  onMove: (_file: FileItem) => void;
  onDelete: (_file: FileItem) => void;
  isTemplate?: boolean;
}

export function FileActionsDropdown({
  file,
  serverId,
  currentPath,
  onEdit,
  onRename,
  onMove,
  onDelete,
  isTemplate = false,
}: FileActionsDropdownProps) {
  const serverDownloadFileMutation = useServerDownloadFileMutation();
  const templateDownloadFileMutation = useTemplateDownloadFileMutation();

  const handleDownloadFile = (file: FileItem) => {
    const filePath =
      currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;

    if (isTemplate) {
      toast.promise(
        templateDownloadFileMutation.mutateAsync({
          file: filePath,
        }),
        {
          loading: "Downloading template file...",
          success: "Template file downloaded successfully",
          error: "Failed to download template file",
        }
      );
    } else {
      toast.promise(
        serverDownloadFileMutation.mutateAsync({
          server: serverId!,
          file: filePath,
        }),
        {
          loading: "Downloading file...",
          success: "File downloaded successfully",
          error: "Failed to download file",
        }
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {file.file && isFileEditableByNameAndType(file.name, file.mimeType) && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(file);
            }}
          >
            Edit
          </DropdownMenuItem>
        )}

        {file.file && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadFile(file);
            }}
            disabled={isTemplate ? templateDownloadFileMutation.isPending : serverDownloadFileMutation.isPending}
          >
            Download
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRename(file);
          }}
        >
          Rename
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onMove(file);
          }}
        >
          Move
        </DropdownMenuItem>

        {file.name !== ".." && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
