import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useStartServerMutation = (
  serverId: string,
  onSuccess?: () => void
) => {
  return useMutation(
    orpc.atlas.startServer.mutationOptions({
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to start server: ${error.message}`);
      },
    })
  );
};
