import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useServerWriteFileMutation = (
  serverId: string,
  filePath: string,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.writeServerFileContents.mutationOptions({
      onSuccess: (_data, variables) => {
        toast.success("File saved successfully");

        // Update the cache directly with the new content
        const queryKey = orpc.atlas.getServerFileContents.queryOptions({
          input: {
            server: serverId,
            file: filePath,
          },
        }).queryKey;
        queryClient.setQueryData(queryKey, variables.content);

        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to save file: ${error.message}`);
      },
    })
  );
};
