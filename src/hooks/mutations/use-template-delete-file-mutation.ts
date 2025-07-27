import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useTemplateDeleteFileMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.deleteTemplateFile.mutationOptions({
      onSuccess: () => {
        toast.success("Template file deleted successfully");
        queryClient.invalidateQueries();
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to delete template file: ${error.message}`);
      },
    })
  );
};