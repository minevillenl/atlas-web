import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GamepadIcon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { getGroupColor } from "@/lib/utils";
import { seo } from "@/utils/seo";

const RouteComponent = () => {
  const { data: groups, isPending } = useQuery({
    ...orpc.atlas.groupList.queryOptions(),
    refetchInterval: 5000,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Groups</h1>
          <p className="text-muted-foreground text-sm">
            Manage your server groups and their configurations
          </p>
        </div>
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>{groups?.length} groups</span>
        <span>•</span>
        <span>
          {groups?.reduce((sum, group) => sum + group.currentServers, 0)} total
          servers
        </span>
        <span>•</span>
        <span>
          {groups?.reduce((sum, group) => sum + group.onlineServers, 0)} running
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isPending
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div>
                      <Skeleton className="mb-2 h-5 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Skeleton className="mx-auto mb-1 h-6 w-8" />
                    <Skeleton className="mx-auto h-3 w-12" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="mx-auto mb-1 h-6 w-8" />
                    <Skeleton className="mx-auto h-3 w-12" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="mx-auto mb-1 h-6 w-8" />
                    <Skeleton className="mx-auto h-3 w-12" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </Card>
            ))
          : groups?.map((group) => {
              const color = getGroupColor(group.name);
              const capacityPercentage =
                (group.totalPlayers / Math.max(group.totalCapacity, 1)) * 100;
              const isHealthy = capacityPercentage <= 90;

              return (
                <Link
                  key={group.name}
                  to="/groups/$groupId"
                  params={{ groupId: group.name }}
                >
                  <Card className="cursor-pointer p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="rounded-lg p-3"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <GamepadIcon
                            className="h-6 w-6"
                            style={{ color: color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{group.displayName}</h3>
                          <p className="text-muted-foreground text-sm">
                            {group.currentServers} server
                            {group.currentServers !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isHealthy ? "success" : "destructive"}>
                        {isHealthy ? "Healthy" : "Issues"}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">
                          {group.onlineServers}
                        </p>
                        <p className="text-muted-foreground text-xs">running</p>
                      </div>
                      <div className="text-center">
                        <p
                          className="text-lg font-bold"
                          style={{ color: color }}
                        >
                          {group.totalPlayers}
                        </p>
                        <p className="text-muted-foreground text-xs">players</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">
                          {group.totalCapacity}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          capacity
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <UsersIcon className="text-muted-foreground h-4 w-4" />
                      <div className="bg-muted h-2 flex-1 rounded-full">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            backgroundColor: color,
                            width: `${Math.min(100, (group.totalPlayers / Math.max(group.totalCapacity, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {Math.round(
                          (group.totalPlayers /
                            Math.max(group.totalCapacity, 1)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_main/groups/")({
  head: () => {
    return {
      meta: [
        ...seo({
          title: "Groups | Atlas",
        }),
      ],
    };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      orpc.atlas.groupList.queryOptions()
    );
  },
  component: RouteComponent,
});
