import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  GamepadIcon,
  History,
  LayoutDashboard,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { getGroupColor } from "@/lib/utils";
import { seo } from "@/utils/seo";

const links = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    to: "/groups/$groupId",
  },
  {
    label: "Activity",
    icon: History,
    to: "/groups/$groupId/activity",
  },
];

const RouteComponent = () => {
  const { groupId } = Route.useParams();

  const { data: group } = useQuery({
    ...orpc.atlas.getGroup.queryOptions({ input: { group: groupId } }),
    refetchInterval: 5000,
  });

  if (!group) {
    return <div>Group not found</div>;
  }

  const color = getGroupColor(groupId);
  const capacityPercentage =
    (group.totalPlayers / Math.max(group.totalCapacity, 1)) * 100;
  const isHealthy = capacityPercentage <= 90;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/groups">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: `${color}30` }}
            >
              <GamepadIcon className="h-6 w-6" style={{ color: color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{group.displayName}</h1>
              <p className="text-muted-foreground">
                {group.type.toUpperCase()} •{" "}
                {group.scalerType.toUpperCase().replace("SCALER", "")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isHealthy ? "success" : "destructive"}>
            {isHealthy ? "Healthy" : "Issues"}
          </Badge>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {links.map((link, index) => (
          <Link
            key={link.label}
            to={link.to}
            params={{ groupId }}
            className="text-muted-foreground hover:text-foreground hover:border-muted-foreground border-b-2 border-transparent px-4 py-2 text-sm font-medium"
            activeOptions={{ exact: index === 0 }}
            activeProps={{
              className:
                "!border-primary !text-primary !border-b-2 !px-4 !py-2 !text-sm !font-medium",
            }}
          >
            <div className="flex items-center gap-2">
              <link.icon className="h-4 w-4" />
              {link.label}
            </div>
          </Link>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/_main/groups/$groupId")({
  loader: async ({ context, params }) => {
    try {
      const group = await context.queryClient.ensureQueryData(
        orpc.atlas.getGroup.queryOptions({
          input: { group: params.groupId },
        })
      );

      if (!group) {
        throw notFound();
      }

      context.queryClient.prefetchQuery({
        ...orpc.atlas.serverList.queryOptions({
          input: {
            group: params.groupId,
          },
        }),
      });

      return group;
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    return {
      meta: [
        ...seo({
          title: `${loaderData?.displayName ?? "Group not found"} | Atlas`,
        }),
      ],
    };
  },
  component: RouteComponent,
});