import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useServerMoveFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.moveServerFile.mutationOptions({
      onSuccess: () => {
        toast.success("File moved successfully");
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(`Failed to move file: ${error.message}`);
      },
    })
  );
};