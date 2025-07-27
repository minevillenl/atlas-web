import { type ReactNode, createContext, useContext, useState, useEffect } from "react";

export interface UploadProgress {
  id: string;
  fileName: string;
  filePath: string;
  serverId: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  startTime: number;
}

interface UploadProgressContextType {
  uploads: UploadProgress[];
  addUpload: (_upload: Omit<UploadProgress, "id" | "startTime">) => string;
  updateUpload: (_id: string, _updates: Partial<UploadProgress>) => void;
  removeUpload: (_id: string) => void;
  clearCompleted: () => void;
}

const UploadProgressContext = createContext<UploadProgressContextType | null>(
  null
);

const UPLOAD_RETENTION_TIME = 30000; // 30 seconds
const MAX_UPLOADS = 50; // Maximum number of uploads to track

export function UploadProgressProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const addUpload = (upload: Omit<UploadProgress, "id" | "startTime">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newUpload: UploadProgress = {
      ...upload,
      id,
      startTime: Date.now(),
    };

    setUploads((prev) => {
      // Limit total uploads to prevent unbounded growth
      const newUploads = [...prev, newUpload];
      if (newUploads.length > MAX_UPLOADS) {
        // Remove oldest completed uploads first
        const uploading = newUploads.filter(u => u.status === "uploading");
        const completed = newUploads.filter(u => u.status !== "uploading")
          .sort((a, b) => a.startTime - b.startTime);
        
        const toKeep = MAX_UPLOADS - uploading.length;
        return [...uploading, ...completed.slice(-toKeep)];
      }
      return newUploads;
    });
    return id;
  };

  const updateUpload = (id: string, updates: Partial<UploadProgress>) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, ...updates } : upload
      )
    );
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  const clearCompleted = () => {
    setUploads((prev) =>
      prev.filter((upload) => upload.status === "uploading")
    );
  };

  // Auto-cleanup completed uploads after retention time
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setUploads((prev) =>
        prev.filter((upload) => {
          // Keep all uploading files
          if (upload.status === "uploading") return true;
          
          // Keep recently completed/errored files
          const age = now - upload.startTime;
          return age < UPLOAD_RETENTION_TIME;
        })
      );
    };

    const interval = setInterval(cleanup, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <UploadProgressContext.Provider
      value={{
        uploads,
        addUpload,
        updateUpload,
        removeUpload,
        clearCompleted,
      }}
    >
      {children}
    </UploadProgressContext.Provider>
  );
}

export function useUploadProgress() {
  const context = useContext(UploadProgressContext);
  if (!context) {
    throw new Error(
      "useUploadProgress must be used within an UploadProgressProvider"
    );
  }
  return context;
}
