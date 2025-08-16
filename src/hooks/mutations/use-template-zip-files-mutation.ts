import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useTemplateZipFilesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.zipTemplateFiles.mutationOptions({
      onSuccess: () => {
        toast.success("Template files zipped successfully");
        queryClient.invalidateQueries({
          queryKey: ["atlas", "getTemplateFiles"],
        });
      },
      onError: (error: Error) => {
        toast.error(`Failed to zip template files: ${error.message}`);
      },
    })
  );
};

export const useTemplateZipFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.atlas.zipTemplateFiles.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    })
  );
};