import { useMutation } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc";

export const useServerDownloadFileMutation = () => {
  return useMutation(
    orpc.atlas.downloadServerFile.mutationOptions({
      onSuccess: (blob, variables) => {
        const url = window.URL.createObjectURL(blob);
        const filename = variables.file.split("/").pop() || "download";

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
    })
  );
};
