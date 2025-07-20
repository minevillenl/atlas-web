import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/lib/orpc";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-btetween">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Online Players
          </div>
          <Badge variant="outline">
            {server.serverInfo?.onlinePlayers ?? 0} /{" "}
            {server.serverInfo?.maxPlayers ?? 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {server.serverInfo?.onlinePlayerNames &&
        server.serverInfo.onlinePlayerNames.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {server.serverInfo.onlinePlayerNames.map((player) => (
              <div
                key={player}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="text-xs font-medium">
                    {player.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{player}</p>
                  <p className="text-muted-foreground text-xs">Online</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <UsersIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">No players online</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/players")({
  component: RouteComponent,
});
