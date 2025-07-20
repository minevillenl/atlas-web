import { createContext, useContext, useState, type ReactNode } from "react";

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
  addUpload: (upload: Omit<UploadProgress, "id" | "startTime">) => string;
  updateUpload: (id: string, updates: Partial<UploadProgress>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
}

const UploadProgressContext = createContext<UploadProgressContextType | null>(
  null
);

export function UploadProgressProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const addUpload = (upload: Omit<UploadProgress, "id" | "startTime">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newUpload: UploadProgress = {
      ...upload,
      id,
      startTime: Date.now(),
    };
    
    setUploads((prev) => [...prev, newUpload]);
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