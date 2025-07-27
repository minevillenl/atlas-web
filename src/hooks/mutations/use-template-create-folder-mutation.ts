import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useTemplateCreateFolderMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.createTemplateFolder.mutationOptions({
      onSuccess: () => {
        toast.success("Template folder created successfully");
        queryClient.invalidateQueries();
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to create folder: ${error.message}`);
      },
    })
  );
};