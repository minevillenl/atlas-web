import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useServerRenameFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.renameServerFile.mutationOptions({
      onSuccess: () => {
        toast.success("File renamed successfully");
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(`Failed to rename file: ${error.message}`);
      },
    })
  );
};