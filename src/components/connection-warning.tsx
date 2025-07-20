import { useState } from "react";

import { AlertTriangleIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWebSocketContext } from "@/contexts/websocket-context";

interface ConnectionWarningProps {
  serverStatus: string;
}

const ConnectionWarning = ({ serverStatus }: ConnectionWarningProps) => {
  const { connectionFailed, connect } = useWebSocketContext();
  const [isDismissed, setIsDismissed] = useState(false);

  const isServerError = serverStatus === "ERROR";

  if (!connectionFailed || isDismissed || isServerError) {
    return null;
  }

  const handleRetry = () => {
    connect();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md">
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-lg dark:border-orange-800 dark:bg-orange-950">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Connection Lost
            </h3>
            <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
              Unable to connect to server after multiple attempts. Real-time
              updates may not work.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900"
              >
                Retry
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-orange-400 hover:text-orange-600 dark:text-orange-500 dark:hover:text-orange-300"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionWarning;
