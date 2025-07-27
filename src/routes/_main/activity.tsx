import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Power,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  UserMinus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { getGroupColor } from "@/lib/utils";
import type { Activity } from "@/server/lib/atlas-api/atlas-api.schemas";
import { seo } from "@/utils/seo";

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

const ITEMS_PER_PAGE = 20;

function ActivityPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: groupsData } = useQuery({
    ...orpc.atlas.groupList.queryOptions(),
  });

  const { data: activitiesData, isPending } = useQuery({
    ...orpc.atlas.getRecentActivities.queryOptions({
      input: {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      },
    }),
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

  const hasNextPage = activities.length === ITEMS_PER_PAGE;
  const hasPrevPage = currentPage > 1;

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Complete history of Atlas system activity
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {isPending ? (
            Array.from({ length: 10 }, (_, i) => (
              <SkeletonActivityItem key={i} />
            ))
          ) : activities.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">No activity found</h3>
              <p>There are no activities to display at this time.</p>
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

        {!isPending && activities.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Page {currentPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!hasPrevPage}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_main/activity")({
  head: () => {
    return {
      meta: [
        ...seo({
          title: "Activity Log | Atlas",
          description: "Complete history of Atlas system activity and events",
        }),
      ],
    };
  },
  component: ActivityPage,
});
