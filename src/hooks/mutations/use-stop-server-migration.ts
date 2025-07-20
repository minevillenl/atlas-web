import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useStopServerMutation = (
  serverId: string,
  onSuccess?: () => void
) => {
  return useMutation(
    orpc.atlas.stopServer.mutationOptions({
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to stop server: ${error.message}`);
      },
    })
  );
};
