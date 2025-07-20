import { forwardRef, useImperativeHandle, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerMoveFileMutation } from "@/hooks/mutations/use-server-move-file-mutation";
import { FileItem } from "@/server/lib/atlas-api/atlas-api.schemas";

interface FileMoveDialogProps {
  serverId: string;
  currentPath: string;
}

export interface FileMoveDialogRef {
  openDialog: (file: FileItem) => void;
}

export const FileMoveDialog = forwardRef<
  FileMoveDialogRef,
  FileMoveDialogProps
>(({ serverId, currentPath }, ref) => {
  const [open, setOpen] = useState(false);
  const [fileToMove, setFileToMove] = useState<FileItem | null>(null);
  const [newFolderPath, setNewFolderPath] = useState("");

  const moveFileMutation = useServerMoveFileMutation();

  const openDialog = (file: FileItem) => {
    setFileToMove(file);
    const currentFilePath =
      currentPath === "/"
        ? `/${file.name}`
        : `${currentPath}/${file.name}`;
    setNewFolderPath(currentFilePath);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setFileToMove(null);
    setNewFolderPath("");
  };

  const confirmMove = () => {
    if (!fileToMove || !newFolderPath.trim()) return;

    const currentFilePath =
      currentPath === "/"
        ? `/${fileToMove.name}`
        : `${currentPath}/${fileToMove.name}`;

    let newPath = newFolderPath.trim();
    
    // Handle relative paths
    if (!newPath.startsWith("/")) {
      // If it's a relative path, resolve it relative to current directory
      if (currentPath === "/") {
        newPath = `/${newPath}`;
      } else {
        newPath = `${currentPath}/${newPath}`;
      }
    }

    moveFileMutation.mutate({
      server: serverId,
      file: currentFilePath,
      newPath,
    });

    closeDialog();
  };

  useImperativeHandle(ref, () => ({
    openDialog,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {fileToMove?.file ? "File" : "Folder"}</DialogTitle>
          <DialogDescription>
            Enter the new name and directory of this{" "}
            {fileToMove?.file ? "file" : "folder"}, relative to the current
            directory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folderpath">
              New location: /home/container{newFolderPath}
            </Label>
            <Input
              id="folderpath"
              value={newFolderPath}
              onChange={(e) => setNewFolderPath(e.target.value)}
              placeholder="config/server.properties"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmMove();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            onClick={confirmMove}
            disabled={!newFolderPath.trim() || moveFileMutation.isPending}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
