import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const useServerCommandMutation = (
  serverId: string,
  onSuccess?: () => void
) => {
  return useMutation(
    orpc.atlas.executeServerCommand.mutationOptions({
      onSuccess: (result) => {
        toast.success("Command executed successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to execute command: ${error.message}`);
      },
    })
  );
};