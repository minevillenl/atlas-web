import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useTemplateWriteFileMutation = (
  filePath: string,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.writeTemplateFileContents.mutationOptions({
      onSuccess: () => {
        toast.success("Template file saved successfully");

        queryClient.invalidateQueries();

        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to save template file: ${error.message}`);
      },
    })
  );
};