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
      onSuccess: (_data, variables) => {
        toast.success("Template file saved successfully");

        // Update the cache directly with the new content
        const queryKey = orpc.atlas.getTemplateFileContents.queryOptions({
          input: {
            file: filePath,
          },
        }).queryKey;
        queryClient.setQueryData(queryKey, variables.content);

        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to save template file: ${error.message}`);
      },
    })
  );
};