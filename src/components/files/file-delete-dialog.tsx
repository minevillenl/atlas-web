import { forwardRef, useImperativeHandle, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useServerDeleteFileMutation } from "@/hooks/mutations/use-server-delete-file-mutation";
import { FileItem } from "@/server/lib/atlas-api/atlas-api.schemas";

interface FileDeleteDialogProps {
  serverId: string;
  currentPath: string;
}

export interface FileDeleteDialogRef {
  openDialog: (_file: FileItem) => void;
}

export const FileDeleteDialog = forwardRef<
  FileDeleteDialogRef,
  FileDeleteDialogProps
>(({ serverId, currentPath }, ref) => {
  const [open, setOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  const deleteFileMutation = useServerDeleteFileMutation();

  const openDialog = (file: FileItem) => {
    setFileToDelete(file);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setFileToDelete(null);
  };

  const confirmDelete = () => {
    if (!fileToDelete) return;

    const filePath =
      currentPath === "/"
        ? `/${fileToDelete.name}`
        : `${currentPath}/${fileToDelete.name}`;

    deleteFileMutation.mutate({
      server: serverId,
      file: filePath,
    });

    closeDialog();
  };

  useImperativeHandle(ref, () => ({
    openDialog,
  }));

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {fileToDelete?.file ? "File" : "Folder"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{fileToDelete?.name}"? This action
            cannot be undone.
            {!fileToDelete?.file &&
              " All contents will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
