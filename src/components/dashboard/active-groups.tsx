
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GamepadIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { getGroupColor } from "@/lib/utils";

const ActiveGroups = () => {
  const { data: groups, isPending } = useQuery({
    ...orpc.atlas.groupList.queryOptions(),
    refetchInterval: 10000, // Group data includes player counts, update moderately frequently
    staleTime: 5000, // Consider data fresh for 5 seconds
  });

  const sortedGroups = groups
    ?.sort((a, b) => b.totalPlayers - a.totalPlayers)
    .slice(0, 4);

  const SkeletonGroupItem = () => (
    <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div>
          <Skeleton className="mb-2 h-5 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-center">
          <Skeleton className="mb-1 h-6 w-8" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="text-center">
          <Skeleton className="mb-1 h-6 w-8" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="p-6 lg:col-span-3">
      <h2 className="text-lg font-semibold">Most Active Groups</h2>
      <div className="space-y-4">
        {isPending ? (
          <>
            <SkeletonGroupItem />
            <SkeletonGroupItem />
            <SkeletonGroupItem />
            <SkeletonGroupItem />
          </>
        ) : (
          sortedGroups?.map((group) => {
            const color = getGroupColor(group.name);

            return (
              <Link
                key={group.name}
                to="/groups/$groupId"
                params={{ groupId: group.name }}
                className="block"
              >
                <div className="bg-muted/50 hover:bg-muted/70 flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div
                      className="rounded-lg p-2"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <GamepadIcon className="h-5 w-5" style={{ color: color }} />
                    </div>
                    <div>
                      <p className="font-semibold">{group.displayName}</p>
                      <p className="text-muted-foreground text-sm">
                        {group.type.toUpperCase()} |{" "}
                        {group.scalerType.toUpperCase().replace("SCALER", "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-bold">{group.currentServers}</p>
                      <p className="text-muted-foreground text-xs">servers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: color }}>
                        {group.totalPlayers}
                      </p>
                      <p className="text-muted-foreground text-xs">players</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default ActiveGroups;
