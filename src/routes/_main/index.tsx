import { createFileRoute } from "@tanstack/react-router";

import ActiveGroups from "@/components/dashboard/active-groups";
import SystemUtilizationCard from "@/components/dashboard/system-utilization-card";
import SystemUtilizationHeaderCards from "@/components/dashboard/system-utlization-header-cards";
import TotalPlayersCard from "@/components/dashboard/total-players-card";
import TotalServersCard from "@/components/dashboard/total-servers-card";
import { Card } from "@/components/ui/card";
import { useAuthedQuery } from "@/features/auth/services/auth.query";
import { orpc } from "@/lib/orpc";
import { seo } from "@/utils/seo";

const RouteComponent = () => {
  const { data: session } = useAuthedQuery();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Welcome, {session.user.name}</h1>
          <p className="text-muted-foreground text-sm">
            Here's your network overview for today
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalServersCard />

        <TotalPlayersCard />

        <SystemUtilizationHeaderCards />
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <ActiveGroups />

        <div className="space-y-6 lg:col-span-2">
          <SystemUtilizationCard />

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="space-y-0">
              <div className="hover:bg-muted/30 flex items-center gap-3 rounded p-3 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      SW-12x1 scaled up
                    </p>
                    <span className="text-muted-foreground ml-2 text-xs">
                      2m
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">+2 servers</p>
                </div>
              </div>

              <div className="bg-border/30 my-2 h-px"></div>

              <div className="hover:bg-muted/30 flex items-center gap-3 rounded p-3 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      Player surge detected
                    </p>
                    <span className="text-muted-foreground ml-2 text-xs">
                      8m
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">+89 players</p>
                </div>
              </div>

              <div className="bg-border/30 my-2 h-px"></div>

              <div className="hover:bg-muted/30 flex items-center gap-3 rounded p-3 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      BW-4x4 scaled down
                    </p>
                    <span className="text-muted-foreground ml-2 text-xs">
                      12m
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">-1 server</p>
                </div>
              </div>

              <div className="bg-border/30 my-2 h-px"></div>

              <div className="hover:bg-muted/30 flex items-center gap-3 rounded p-3 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      WildWest restarted
                    </p>
                    <span className="text-muted-foreground ml-2 text-xs">
                      15m
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">Maintenance</p>
                </div>
              </div>

              <div className="bg-border/30 my-2 h-px"></div>

              <div className="hover:bg-muted/30 flex items-center gap-3 rounded p-3 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      Lobby-3 went offline
                    </p>
                    <span className="text-muted-foreground ml-2 text-xs">
                      22m
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">Auto-failover</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_main/")({
  head: () => {
    return {
      meta: [
        ...seo({
          title: "Dashboard | Atlas",
        }),
      ],
    };
  },
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      orpc.atlas.utilization.queryOptions()
    );
    context.queryClient.prefetchQuery(orpc.atlas.playerCount.queryOptions());
    context.queryClient.prefetchQuery(orpc.atlas.serverCount.queryOptions());
    context.queryClient.prefetchQuery(orpc.atlas.groupList.queryOptions());
  },
  component: RouteComponent,
});
