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
      onSuccess: () => {
        toast.success("File saved successfully");

        queryClient.invalidateQueries();

        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to save file: ${error.message}`);
      },
    })
  );
};
