import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useServerZipFilesMutation = (serverId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.zipServerFiles.mutationOptions({
      onSuccess: () => {
        toast.success("Files zipped successfully");
        queryClient.invalidateQueries({
          queryKey: ["atlas", "getServerFiles", { server: serverId }],
        });
      },
      onError: (error: Error) => {
        toast.error(`Failed to zip files: ${error.message}`);
      },
    })
  );
};

export const useServerZipFolderMutation = (_serverId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.zipServerFiles.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    })
  );
};