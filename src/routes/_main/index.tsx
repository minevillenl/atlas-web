import { createFileRoute } from "@tanstack/react-router";

import ActiveGroups from "@/components/dashboard/active-groups";
import RecentActivity from "@/components/dashboard/recent-activity";
import SystemUtilizationCard from "@/components/dashboard/system-utilization-card";
import SystemUtilizationHeaderCards from "@/components/dashboard/system-utlization-header-cards";
import TotalPlayersCard from "@/components/dashboard/total-players-card";
import TotalServersCard from "@/components/dashboard/total-servers-card";
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

          <RecentActivity />
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
    context.queryClient.prefetchQuery(orpc.atlas.getRecentActivities.queryOptions({ input: { limit: 5 } }));
  },
  component: RouteComponent,
});
