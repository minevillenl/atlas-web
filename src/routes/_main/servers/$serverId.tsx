import { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  notFound,
} from "@tanstack/react-router";
import {
  CircleStopIcon,
  FolderIcon,
  PlayCircleIcon,
  RefreshCcwIcon,
  TerminalIcon,
  UsersIcon,
} from "lucide-react";

import { getStatus } from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { WebSocketProvider, useWebSocketContext } from "@/contexts/websocket-context";
import { orpc } from "@/lib/orpc";
import { seo } from "@/utils/seo";

const links = [
  {
    label: "Console",
    icon: TerminalIcon,
    to: "/servers/$serverId",
  },
  {
    label: "Files",
    icon: FolderIcon,
    to: "/servers/$serverId/files/",
  },
  {
    label: "Players",
    icon: UsersIcon,
    to: "/servers/$serverId/players",
  },
];

const ServerContent = () => {
  const { serverId } = Route.useParams();
  const [realtimeServerInfo, setRealtimeServerInfo] = useState<any>(null);
  const { sendMessage, isConnected, subscribe } = useWebSocketContext();

  const { data: server } = useQuery({
    ...orpc.atlas.getServer.queryOptions({
      input: { server: serverId },
    }),
  });

  // Subscribe to WebSocket messages
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.type === "server-info") {
        setRealtimeServerInfo(message.data);
      } else if (message.type === "status-update") {
        setRealtimeServerInfo((prev: any) => ({
          ...prev,
          status: message.data.status,
          serverId: message.data.serverId,
        }));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Subscribe to status updates when connected
  useEffect(() => {
    if (isConnected) {
      // Add a small delay to ensure WebSocket is fully ready
      setTimeout(() => {
        sendMessage({
          type: "subscribe",
          streams: ["status"],
          targets: [serverId],
        });
      }, 100);
    }
  }, [isConnected, sendMessage, serverId]);

  if (!server) {
    return <div>Loading...</div>;
  }

  const currentStatus =
    realtimeServerInfo?.status ?? server.serverInfo?.status ?? "UNKNOWN";
  const isRunning = currentStatus === "RUNNING";
  const isStopped = currentStatus === "STOPPED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center md:gap-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              {getStatus(currentStatus)}
              <h1 className="text-2xl font-bold">{server.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              {server.address}:{server.port}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            disabled={isRunning}
            className="h-[38px] w-[64px] rounded-md border border-green-500 bg-green-600 text-white hover:!bg-green-700 disabled:opacity-50"
          >
            <PlayCircleIcon size={20} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isStopped}
            className="h-[38px] w-[64px] rounded-md border border-neutral-500 bg-neutral-700 text-white hover:!bg-neutral-600 disabled:opacity-50"
          >
            <RefreshCcwIcon size={20} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isStopped}
            className="h-[38px] w-[64px] rounded-md border border-red-600 bg-red-800 text-white hover:!bg-red-900 disabled:opacity-50"
          >
            <CircleStopIcon size={20} />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {links.map((link, index) => (
          <Link
            key={link.label}
            to={link.to}
            params={{ serverId }}
            className="text-muted-foreground hover:text-foreground hover:border-muted-foreground border-b-2 border-transparent px-4 py-2 text-sm font-medium"
            activeOptions={{ exact: index === 0 }}
            activeProps={{
              className:
                "!border-primary !text-primary !border-b-2 !px-4 !py-2 !text-sm !font-medium",
            }}
          >
            <div className="flex items-center gap-2">
              <link.icon className="h-4 w-4" />
              {link.label}
            </div>
          </Link>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

const RouteComponent = () => {
  const { serverId } = Route.useParams();
  return (
    <WebSocketProvider serverId={serverId}>
      <ServerContent />
    </WebSocketProvider>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId")({
  loader: async ({ context, params }) => {
    try {
      const server = await context.queryClient.ensureQueryData(
        orpc.atlas.getServer.queryOptions({
          input: { server: params.serverId },
        })
      );

      if (!server) {
        throw notFound();
      }

      return server;
    } catch {
      throw notFound();
    }
  },
  head: async ({ loaderData }) => {
    return {
      meta: [
        ...seo({
          title: `${loaderData?.name ?? "Server not found"} | Atlas`,
        }),
      ],
    };
  },

  component: RouteComponent,
});
