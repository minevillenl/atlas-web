import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useRestartServerMutation = (
  serverId: string,
  onSuccess?: () => void
) => {
  return useMutation(
    orpc.atlas.restartServer.mutationOptions({
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to restart server: ${error.message}`);
      },
    })
  );
};
