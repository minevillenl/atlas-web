import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Power,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  UserMinus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { getGroupColor } from "@/lib/utils";
import type { Activity } from "@/server/lib/atlas-api/atlas-api.schemas";

const getActivityIcon = (activity: Activity) => {
  const iconClass = "h-4 w-4";

  switch (activity.activityType) {
    case "SCALING_OPERATION":
      if (activity.metadata?.direction === "up") {
        return <TrendingUp className={iconClass} />;
      } else {
        return <TrendingDown className={iconClass} />;
      }
    case "PLAYER_SURGE":
      return <Users className={iconClass} />;
    case "PLAYER_DROP":
      return <UserMinus className={iconClass} />;
    case "CAPACITY_REACHED":
      return <AlertTriangle className={iconClass} />;
    case "SERVER_RESTART":
      return <RotateCcw className={iconClass} />;
    case "ATLAS_LIFECYCLE":
      return <Power className={iconClass} />;
    default:
      return <div className="h-2 w-2 rounded-full bg-current"></div>;
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

const formatTriggerReason = (reason: string): string => {
  if (!reason) return "";

  const formatted = reason
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Make specific improvements
  return formatted
    .replace("Minimum Servers Enforcement", "Maintaining minimum servers")
    .replace("Maximum Servers Enforcement", "Maintaining maximum servers")
    .replace("Scale Up Threshold", "High utilization")
    .replace("Scale Down Threshold", "Low utilization");
};

const getActivityDetails = (activity: Activity) => {
  if (!activity.metadata) return { summary: "", details: "" };

  try {
    const metadata = activity.metadata;

    switch (activity.activityType) {
      case "SCALING_OPERATION":
        const beforeCount = metadata.servers_before || 0;
        const afterCount = metadata.servers_after || 0;
        const diff = afterCount - beforeCount;
        const direction = metadata.direction === "up" ? "+" : "-";

        return {
          summary: `${beforeCount} → ${afterCount} servers`,
          details:
            formatTriggerReason(metadata.trigger_reason) ||
            "Auto-scaling triggered",
          badge: `${direction}${Math.abs(diff)}`,
        };
      case "PLAYER_SURGE":
        const playerDiff =
          metadata.newPlayerCount - metadata.previousPlayerCount;
        return {
          summary: `${metadata.previousPlayerCount} → ${metadata.newPlayerCount} players`,
          details: `Surge detected in ${metadata.timeWindow || "5m"}`,
          badge: `+${playerDiff}`,
        };
      case "PLAYER_DROP":
        const dropDiff = metadata.previousPlayerCount - metadata.newPlayerCount;
        return {
          summary: `${metadata.previousPlayerCount} → ${metadata.newPlayerCount} players`,
          details: `Drop detected in ${metadata.timeWindow || "5m"}`,
          badge: `-${dropDiff}`,
        };
      case "CAPACITY_REACHED":
        return {
          summary: `${metadata.newPlayerCount}/${metadata.capacity} players`,
          details: "Server at maximum capacity",
          badge: "FULL",
        };
      case "SERVER_RESTART":
        return {
          summary: metadata.reason || "Manual restart",
          details: metadata.previousUptime
            ? `Uptime: ${metadata.previousUptime}`
            : "",
          badge: "RESTART",
        };
      case "ATLAS_LIFECYCLE":
        return {
          summary: "System event",
          details: "Atlas lifecycle change",
          badge: "SYSTEM",
        };
      default:
        return { summary: "", details: "", badge: "" };
    }
  } catch {
    return { summary: "", details: "", badge: "" };
  }
};

const SkeletonActivityItem = () => (
  <div className="bg-muted/50 rounded-lg p-4">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div>
          <Skeleton className="mb-1 h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  </div>
);

export default function RecentActivity() {
  const { data: activitiesData, isPending } = useQuery({
    ...orpc.atlas.getRecentActivities.queryOptions({ input: { limit: 5 } }),
    refetchInterval: 30000,
  });

  const { data: groupsData } = useQuery({
    ...orpc.atlas.groupList.queryOptions(),
  });

  const activities = (activitiesData?.data || []).filter(
    (activity) => activity.activityType !== "BACKUP_OPERATION"
  );
  const groups = groupsData || [];

  const getGroupInternalName = (displayName: string): string => {
    const group = groups.find(
      (g) => g.displayName === displayName || g.name === displayName
    );
    return group?.name || displayName;
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Link
          to="/activity"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {isPending ? (
          <>
            <SkeletonActivityItem />
            <SkeletonActivityItem />
            <SkeletonActivityItem />
          </>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const details = getActivityDetails(activity);
            const internalGroupName = activity.groupName
              ? getGroupInternalName(activity.groupName)
              : undefined;
            const groupColor = internalGroupName
              ? getGroupColor(internalGroupName)
              : undefined;

            return (
              <div
                key={activity.id}
                className="bg-muted/50 hover:bg-muted/70 rounded-lg p-4 transition-all duration-200"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        groupColor
                          ? ""
                          : "bg-primary/20 text-primary"
                      }`}
                      style={
                        groupColor
                          ? {
                              backgroundColor: `${groupColor}20`,
                              color: groupColor,
                            }
                          : undefined
                      }
                    >
                      {getActivityIcon(activity)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {activity.activityType
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      {activity.groupName && (
                        <p 
                          className={`text-xs ${
                            groupColor ? "" : "text-primary"
                          }`}
                          style={groupColor ? { color: groupColor } : undefined}
                        >
                          {activity.groupName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {details.badge && (
                      <Badge
                        variant={
                          details.badge.includes("+") ||
                          details.badge === "SUCCESS" ||
                          details.badge === "SURGE"
                            ? "success"
                            : details.badge.includes("-") ||
                                details.badge === "FAILED" ||
                                details.badge === "FULL"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {details.badge}
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    {details.summary || activity.description}
                  </p>
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>
                      {details.details ||
                        `Triggered by ${activity.triggeredBy}`}
                    </span>
                    <span className="capitalize">{activity.triggeredBy}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
