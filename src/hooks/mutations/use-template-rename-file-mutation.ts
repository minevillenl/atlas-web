import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useTemplateRenameFileMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.renameTemplateFile.mutationOptions({
      onSuccess: () => {
        toast.success("Template file renamed successfully");
        queryClient.invalidateQueries();
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to rename template file: ${error.message}`);
      },
    })
  );
};