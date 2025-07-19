import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ServerIcon } from "lucide-react";

import { getStatus } from "@/components/server-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

interface GroupServerListProps {
  groupId: string;
}

export const GroupServerList = ({ groupId }: GroupServerListProps) => {
  const { data: servers, isPending: serversLoading } = useQuery({
    ...orpc.atlas.serverList.queryOptions({
      input: {
        group: groupId.toLowerCase(),
      },
    }),
    refetchInterval: 5000,
  });

  const ServersSkeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="mb-1 h-4 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (serversLoading) {
    return <ServersSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servers ({servers?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {servers && servers.length > 0 ? (
          <div className="space-y-4">
            {servers.map((server) => (
              <div key={server.serverId}>
                <Link
                  to="/servers/$serverId"
                  params={{ serverId: server.serverId }}
                  className="block"
                >
                  <div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatus(server.serverInfo?.status || "unknown")}
                    <div>
                      <p className="font-medium">{server.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {server.address}:{server.port}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {server.serverInfo?.onlinePlayers || 0} /{" "}
                      {server.serverInfo?.maxPlayers || 0}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {server.serverInfo?.status || "unknown"}
                    </p>
                  </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            <ServerIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No servers found for this group</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
