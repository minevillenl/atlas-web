import { useEffect, useState } from "react";

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
import { useWebSocketContext } from "@/contexts/websocket-context";
import { orpc } from "@/lib/orpc";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KiB", "MiB", "GiB", "TiB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

interface ServerStats {
  cpu: number;
  ram: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    uploadBytes: number;
    downloadBytes: number;
  };
  players: number;
  maxPlayers: number;
  status: string;
}

const RouteComponent = () => {
  const { serverId } = Route.useParams();
  const [realtimeStats, setRealtimeStats] = useState<ServerStats | null>(null);
  const [realtimeServerInfo, setRealtimeServerInfo] = useState<any>(null);

  const { data: server } = useQuery({
    ...orpc.atlas.getServer.queryOptions({
      input: { server: serverId },
    }),
  });

  const { subscribe } = useWebSocketContext();

  // Subscribe to WebSocket messages
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.type === "status-update") {
        setRealtimeServerInfo((prev: any) => ({
          ...prev,
          status: message.data.status,
          serverId: message.data.serverId,
        }));
      } else if (message.type === "stats") {
        setRealtimeStats(message.data);
      } else if (message.type === "server-info") {
        setRealtimeServerInfo(message.data);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Use real-time stats if available, otherwise fallback to server data
  const currentStatus =
    realtimeServerInfo?.status ?? server?.serverInfo?.status ?? "unknown";
  const isServerStopped = currentStatus === "STOPPED";

  const currentStats = realtimeStats || {
    cpu: server?.resourceMetrics?.cpuUsage || 0,
    ram: {
      used: server?.resourceMetrics?.memoryUsed || 0,
      total: server?.resourceMetrics?.memoryTotal || 0,
      percentage:
        server?.resourceMetrics?.memoryUsed &&
        server?.resourceMetrics?.memoryTotal
          ? (server.resourceMetrics.memoryUsed /
              server.resourceMetrics.memoryTotal) *
            100
          : 0,
    },
    disk: {
      used: server?.resourceMetrics?.diskUsed || 0,
      total: server?.resourceMetrics?.diskTotal || 0,
      percentage: 0,
    },
    network: {
      uploadBytes: server?.resourceMetrics?.networkSendBandwidth || 0,
      downloadBytes: server?.resourceMetrics?.networkReceiveBandwidth || 0,
    },
    players: realtimeServerInfo?.players ?? 0,
    maxPlayers: realtimeServerInfo?.maxPlayers ?? 0,
    status: currentStatus,
  };

  // Override all stats to 0 when server is stopped
  if (isServerStopped) {
    currentStats.cpu = 0;
    currentStats.ram.used = 0;
    currentStats.ram.percentage = 0;
    currentStats.disk.used = 0;
    currentStats.disk.percentage = 0;
    currentStats.network.uploadBytes = 0;
    currentStats.network.downloadBytes = 0;
    currentStats.players = 0;
  }

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
                {currentStats.cpu.toFixed(1)}%
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
                {formatBytes(currentStats.ram.used)}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">Memory</p>
              <p className="text-muted-foreground text-[10px] sm:text-xs">
                / {formatBytes(currentStats.ram.total)}
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
                {formatBytes(currentStats.disk.used)}
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
                ↑ {formatBytes(currentStats.network.uploadBytes)}/s
              </p>
              <p className="text-xs font-semibold sm:text-sm">
                ↓ {formatBytes(currentStats.network.downloadBytes)}/s
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

      <div className="mt-4 sm:mt-6 mb-8">
        <ServerConsole
          server={{
            ...server,
            // Override with real-time server info if available
            serverInfo: {
              ...server.serverInfo,
              status: currentStats.status,
            },
          }}
        />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/")({
  component: RouteComponent,
});
