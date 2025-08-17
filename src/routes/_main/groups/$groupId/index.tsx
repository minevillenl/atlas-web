import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  MinusIcon,
  PlusIcon,
  ServerIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { GroupServerList } from "@/components/group-server-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { getGroupColor } from "@/lib/utils";

const RouteComponent = () => {
  const { groupId } = Route.useParams();

  const { data: group, isPending: groupLoading } = useQuery({
    ...orpc.atlas.getGroup.queryOptions({ input: { group: groupId } }),
    refetchInterval: 5000,
  });

  const mutation = useMutation(
    orpc.atlas.scale.mutationOptions({
      onSuccess: async () => {
        await window.getQueryClient().invalidateQueries();
        await window.getRouter().invalidate();
      },
    })
  );

  if (!group) {
    return <div>Loading...</div>;
  }

  const color = getGroupColor(groupId);
  const capacityPercentage =
    (group.totalPlayers / Math.max(group.totalCapacity, 1)) * 100;

  const SidebarSkeleton = () => (
    <div className="space-y-6 lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Player Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
              <Skeleton className="h-full w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            Scaling Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Running Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: color }}>
              {group.onlineServers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: color }}>
              {group.currentServers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: color }}>
              {group.totalPlayers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: color }}>
              {group.totalCapacity}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <GroupServerList groupId={groupId} />
        </div>

        {groupLoading ? (
          <SidebarSkeleton />
        ) : (
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Player Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{group.totalPlayers} players</span>
                    <span>{Math.round(capacityPercentage)}%</span>
                  </div>
                  <div className="bg-muted h-3 overflow-hidden rounded-full">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        backgroundColor: color,
                        width: `${Math.min(100, capacityPercentage)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ServerIcon className="h-5 w-5" />
                  Scaling Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">
                      Current Servers: {group.currentServers}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Range: {group.minServers} -{" "}
                      {group.maxServers === -1 ? "∞" : group.maxServers} servers
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.promise(
                          mutation.mutateAsync({
                            group: groupId,
                            direction: "up",
                          }),
                          {
                            loading: "Scaling up...",
                            success: {
                              message: "Scaled up!",
                              description:
                                "It might take a second for the server to appear.",
                            },
                            error: "Failed to scale up",
                          }
                        )
                      }
                      disabled={
                        (group.maxServers !== -1 &&
                          group.currentServers >= group.maxServers) ||
                        mutation.isPending
                      }
                      className="w-full"
                    >
                      <PlusIcon className="mr-1 h-4 w-4" />
                      Scale Up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.promise(
                          mutation.mutateAsync({
                            group: groupId,
                            direction: "down",
                          }),
                          {
                            loading: "Scaling down...",
                            success: {
                              message: "Scaled down!",
                              description:
                                "It might take a second for the server to disappear.",
                            },
                            error: "Failed to scale down",
                          }
                        )
                      }
                      disabled={
                        group.currentServers <= group.minServers ||
                        mutation.isPending
                      }
                      className="w-full"
                    >
                      <MinusIcon className="mr-1 h-4 w-4" />
                      Scale Down
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_main/groups/$groupId/")({
  component: RouteComponent,
});