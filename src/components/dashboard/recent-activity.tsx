import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import type { Activity } from "@/server/lib/atlas-api/atlas-api.schemas";

const getActivityIcon = (activityType: Activity["activityType"]) => {
  switch (activityType) {
    case "SCALING_OPERATION":
      return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
    case "PLAYER_SURGE":
      return <div className="h-2 w-2 rounded-full bg-blue-500"></div>;
    case "SERVER_RESTART":
      return <div className="h-2 w-2 rounded-full bg-purple-500"></div>;
    case "ATLAS_LIFECYCLE":
      return <div className="h-2 w-2 rounded-full bg-orange-500"></div>;
    default:
      return <div className="h-2 w-2 rounded-full bg-gray-500"></div>;
  }
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(
    timestamp + (timestamp.includes("Z") ? "" : "Z")
  );
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
};

const getActivitySummary = (activity: Activity): string => {
  if (!activity.metadata) return "";

  try {
    const metadata = activity.metadata;

    switch (activity.activityType) {
      case "SCALING_OPERATION":
        if (metadata.direction === "up") {
          const diff = metadata.servers_after - metadata.servers_before;
          return `+${diff} servers`;
        } else if (metadata.direction === "down") {
          const diff = metadata.servers_before - metadata.servers_after;
          return `-${diff} servers`;
        }
        return "scaled";
      case "PLAYER_SURGE":
        const playerDiff =
          metadata.newPlayerCount - metadata.previousPlayerCount;
        return `+${playerDiff} players`;
      case "SERVER_RESTART":
        return metadata.reason || "restarted";
      case "ATLAS_LIFECYCLE":
        return "system event";
      default:
        return "";
    }
  } catch {
    return "";
  }
};

const SkeletonActivityItem = () => (
  <div className="flex items-center gap-3 rounded p-3">
    <div className="flex-shrink-0">
      <Skeleton className="h-2 w-2 rounded-full" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between">
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export default function RecentActivity() {
  const { data: activitiesData, isPending } = useQuery({
    ...orpc.atlas.getRecentActivities.queryOptions({ input: { limit: 5 } }),
    refetchInterval: 30000,
  });

  const activities = activitiesData?.data || [];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Recent Activity</h2>
      <div className="space-y-0">
        {isPending ? (
          <>
            <SkeletonActivityItem />
            <div className="bg-border/30 my-2 h-px"></div>
            <SkeletonActivityItem />
            <div className="bg-border/30 my-2 h-px"></div>
            <SkeletonActivityItem />
          </>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id}>
              <div className="hover:bg-muted/30 flex items-center gap-3 rounded p-3 transition-colors">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      {activity.groupName
                        ? `${activity.groupName} scaled ${activity.metadata?.direction || ""}`
                        : activity.description}
                    </p>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {getActivitySummary(activity)}
                  </p>
                </div>
              </div>
              {index < activities.length - 1 && (
                <div className="bg-border/30 my-2 h-px"></div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
