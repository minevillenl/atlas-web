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
import { useServerRenameFileMutation } from "@/hooks/mutations/use-server-rename-file-mutation";
import { useTemplateRenameFileMutation } from "@/hooks/mutations/use-template-rename-file-mutation";
import { FileItem } from "@/server/lib/atlas-api/atlas-api.schemas";

interface FileRenameDialogProps {
  serverId?: string;
  currentPath: string;
  isTemplate?: boolean;
}

export interface FileRenameDialogRef {
  openDialog: (_file: FileItem) => void;
}

export const FileRenameDialog = forwardRef<
  FileRenameDialogRef,
  FileRenameDialogProps
>(({ serverId, currentPath, isTemplate = false }, ref) => {
  const [open, setOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const serverRenameFileMutation = useServerRenameFileMutation();
  const templateRenameFileMutation = useTemplateRenameFileMutation();

  const openDialog = (file: FileItem) => {
    setFileToRename(file);
    setNewFileName(file.name);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setFileToRename(null);
    setNewFileName("");
  };

  const confirmRename = () => {
    if (!fileToRename || !newFileName.trim()) return;

    const oldPath =
      currentPath === "/"
        ? `/${fileToRename.name}`
        : `${currentPath}/${fileToRename.name}`;

    const newPath =
      currentPath === "/"
        ? `/${newFileName.trim()}`
        : `${currentPath}/${newFileName.trim()}`;

    if (isTemplate) {
      templateRenameFileMutation.mutate({
        oldPath,
        newPath,
      });
    } else {
      serverRenameFileMutation.mutate({
        server: serverId!,
        oldPath,
        newPath,
      });
    }

    closeDialog();
  };

  useImperativeHandle(ref, () => ({
    openDialog,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Rename {fileToRename?.file ? "File" : "Folder"}
          </DialogTitle>
          <DialogDescription>
            Enter a new name for "{fileToRename?.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Name</Label>
            <Input
              id="filename"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new filename"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmRename();
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
            onClick={confirmRename}
            disabled={
              !newFileName.trim() ||
              newFileName === fileToRename?.name ||
              (isTemplate ? templateRenameFileMutation.isPending : serverRenameFileMutation.isPending)
            }
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
