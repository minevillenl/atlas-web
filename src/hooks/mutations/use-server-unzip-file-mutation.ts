import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useServerUnzipFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.unzipServerFile.mutationOptions({
      onSuccess: () => {
        toast.success("File unzipped successfully");
        queryClient.invalidateQueries();
      },
      onError: (error: Error) => {
        toast.error(`Failed to unzip file: ${error.message}`);
      },
    })
  );
};
