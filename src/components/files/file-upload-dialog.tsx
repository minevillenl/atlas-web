import { forwardRef, useImperativeHandle, useRef, useState } from "react";

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
import { useServerUploadFileMutation } from "@/hooks/mutations/use-server-upload-file-mutation";
import { useTemplateUploadFileMutation } from "@/hooks/mutations/use-template-upload-file-mutation";

interface FileUploadDialogProps {
  serverId?: string;
  currentPath: string;
  isTemplate?: boolean;
}

export interface FileUploadDialogRef {
  openDialog: () => void;
}

export const FileUploadDialog = forwardRef<
  FileUploadDialogRef,
  FileUploadDialogProps
>(({ serverId, currentPath, isTemplate = false }, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serverUploadMutation = useServerUploadFileMutation(serverId || "");
  const templateUploadMutation = useTemplateUploadFileMutation();

  const openDialog = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const filePath =
      currentPath === "/"
        ? `/${selectedFile.name}`
        : `${currentPath}/${selectedFile.name}`;

    // Close dialog immediately
    closeDialog();

    // Start upload in background
    if (isTemplate) {
      templateUploadMutation.mutate({
        path: filePath,
        file: selectedFile,
      });
    } else {
      serverUploadMutation.mutate({
        server: serverId!,
        path: filePath,
        file: selectedFile,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  useImperativeHandle(ref, () => ({
    openDialog,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Select a file to upload to the current directory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>

          {selectedFile && (
            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-muted-foreground text-sm">
            <p>
              <strong>Upload to:</strong> {currentPath === "/" ? "/" : currentPath}/
              {selectedFile?.name || "[filename]"}
            </p>
            <p className="mt-1">Maximum file size: 8GB</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});