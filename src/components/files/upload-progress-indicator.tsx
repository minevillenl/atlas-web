import { CheckCircle, FileUp, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUploadProgress, type UploadProgress } from "@/contexts/upload-progress-context";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatElapsedTime = (startTime: number, completed: boolean): string => {
  const elapsed = Date.now() - startTime;
  const seconds = Math.floor(elapsed / 1000);
  
  if (completed) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  if (seconds < 60) return `${seconds}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m elapsed`;
};

interface UploadProgressItemProps {
  upload: UploadProgress;
  onRemove: (id: string) => void;
}

function UploadProgressItem({ upload, onRemove }: UploadProgressItemProps) {
  const getStatusIcon = () => {
    switch (upload.status) {
      case "uploading":
        return <FileUp className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (upload.status) {
      case "uploading":
        if (upload.progress === 100) {
          return `Processing on server • ${formatElapsedTime(upload.startTime, false)}`;
        }
        return `${Math.round(upload.progress)}% • ${formatElapsedTime(upload.startTime, false)}`;
      case "completed":
        return `Completed • ${formatElapsedTime(upload.startTime, true)}`;
      case "error":
        return upload.error || "Upload failed";
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium truncate">{upload.fileName}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onRemove(upload.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <p className="text-muted-foreground text-xs truncate mb-1">
          {upload.filePath}
        </p>
        
        {upload.status === "uploading" && (
          <Progress 
            value={upload.progress} 
            className="h-1 mb-1" 
          />
        )}
        
        <p className="text-muted-foreground text-xs">
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}

export function UploadProgressIndicator() {
  const { uploads, removeUpload, clearCompleted } = useUploadProgress();

  if (uploads.length === 0) {
    return null;
  }

  const activeUploads = uploads.filter(u => u.status === "uploading");
  const completedUploads = uploads.filter(u => u.status !== "uploading");

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-hidden shadow-lg z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {activeUploads.length > 0 
              ? `Uploading ${activeUploads.length} file${activeUploads.length === 1 ? "" : "s"}...`
              : "Uploads"
            }
          </CardTitle>
          {completedUploads.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearCompleted}
            >
              Clear completed
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {uploads.map((upload) => (
            <UploadProgressItem
              key={upload.id}
              upload={upload}
              onRemove={removeUpload}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}