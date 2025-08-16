import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useTemplateUnzipFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.unzipTemplateFile.mutationOptions({
      onSuccess: () => {
        toast.success("Template file unzipped successfully");
        queryClient.invalidateQueries();
      },
      onError: (error: Error) => {
        toast.error(`Failed to unzip template file: ${error.message}`);
      },
    })
  );
};