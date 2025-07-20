import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useServerDeleteFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.deleteServerFile.mutationOptions({
      onSuccess: () => {
        toast.success("File deleted successfully");
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(`Failed to delete file: ${error.message}`);
      },
    })
  );
};
