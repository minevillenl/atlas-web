import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  WifiIcon,
} from "lucide-react";

import ServerConsole from "@/components/server/server-console";
import { Card } from "@/components/ui/card";
import { orpc } from "@/lib/orpc";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KiB", "MiB", "GiB", "TiB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const RouteComponent = () => {
  const { serverId } = Route.useParams();

  const { data: server } = useQuery({
    ...orpc.atlas.getServer.queryOptions({
      input: { server: serverId },
    }),
  });

  if (!server) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="h-20 p-4 transition-shadow hover:shadow-sm sm:h-24 sm:p-6">
          <div className="flex h-full items-center justify-between">
            <div className="flex h-full flex-col justify-center">
              <p className="text-base font-semibold sm:text-lg">
                {server.resourceMetrics?.cpuUsage?.toFixed(1) ?? "0"}%
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                CPU Load
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/20 p-2 sm:p-3">
              <CpuIcon className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
            </div>
          </div>
        </Card>

        <Card className="h-20 p-4 transition-shadow hover:shadow-sm sm:h-24 sm:p-6">
          <div className="flex h-full items-center justify-between">
            <div className="flex h-full flex-col justify-center">
              <p className="text-base font-semibold sm:text-lg">
                {formatBytes(server.resourceMetrics?.memoryUsed ?? 0)}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">Memory</p>
              <p className="text-muted-foreground text-[10px] sm:text-xs">
                / {formatBytes(server.resourceMetrics?.memoryTotal ?? 0)}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-2 sm:p-3">
              <MemoryStickIcon className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
            </div>
          </div>
        </Card>

        <Card className="h-20 p-4 transition-shadow hover:shadow-sm sm:h-24 sm:p-6">
          <div className="flex h-full items-center justify-between">
            <div className="flex h-full flex-col justify-center">
              <p className="text-base font-semibold sm:text-lg">
                {formatBytes(server.resourceMetrics?.diskUsed ?? 0)}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Disk Used
              </p>
            </div>
            <div className="rounded-lg bg-purple-500/20 p-2 sm:p-3">
              <HardDriveIcon className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
            </div>
          </div>
        </Card>

        <Card className="h-20 p-4 transition-shadow hover:shadow-sm sm:h-24 sm:p-6">
          <div className="flex h-full items-center justify-between">
            <div className="flex h-full flex-col justify-center">
              <p className="text-xs font-semibold sm:text-sm">
                ↑{" "}
                {formatBytes(server.resourceMetrics?.networkSendBandwidth ?? 0)}
                /s
              </p>
              <p className="text-xs font-semibold sm:text-sm">
                ↓{" "}
                {formatBytes(
                  server.resourceMetrics?.networkReceiveBandwidth ?? 0
                )}
                /s
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Network
              </p>
            </div>
            <div className="rounded-lg bg-green-500/20 p-2 sm:p-3">
              <WifiIcon className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 sm:mt-6">
        <ServerConsole server={server} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/")({
  component: RouteComponent,
});
