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

interface FileCreateDialogProps {
  onCreateFile: () => void;
  onCreateFolder: (folderName: string) => void;
}

export interface FileCreateDialogRef {
  openFileDialog: () => void;
  openFolderDialog: () => void;
}

export const FileCreateDialog = forwardRef<
  FileCreateDialogRef,
  FileCreateDialogProps
>(({ onCreateFile, onCreateFolder }, ref) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"file" | "folder">("file");
  const [name, setName] = useState("");

  const openFileDialog = () => {
    setType("file");
    setName("");
    setOpen(true);
  };

  const openFolderDialog = () => {
    setType("folder");
    setName("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setName("");
  };

  const handleConfirm = () => {
    if (type === "file") {
      onCreateFile();
      closeDialog();
    } else {
      if (!name.trim()) return;
      onCreateFolder(name.trim());
      closeDialog();
    }
  };

  useImperativeHandle(ref, () => ({
    openFileDialog,
    openFolderDialog,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {type === "file" ? "File" : "Folder"}</DialogTitle>
          <DialogDescription>
            Enter a name for the new {type === "file" ? "file" : "folder"}.
          </DialogDescription>
        </DialogHeader>

        {type === "folder" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm();
                  }
                }}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={type === "folder" && !name.trim()}>
            {type === "file" ? "Create File" : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});