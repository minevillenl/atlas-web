import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import ServerCard, { ServerCardSkeleton } from "@/components/server-card";
import { type FilterInput, ServerFilters } from "@/components/server-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { Server } from "@/server/lib/atlas-api/atlas-api.schemas";
import { seo } from "@/utils/seo";

const RouteComponent = () => {
  const [filterInput, setFilterInput] = useState<FilterInput>({});

  const queryOptions = orpc.atlas.serverList.queryOptions({
    input: filterInput,
  });

  const { data: servers, isLoading } = useQuery({
    ...queryOptions,
    placeholderData: (previousData) => previousData,
    refetchInterval: 5000,
  });

  const { data: allServers } = useQuery({
    ...orpc.atlas.serverList.queryOptions({ input: {} }),
    refetchInterval: 5000,
  });

  const availableGroups = useMemo(() => {
    if (!allServers) return [];
    const groups = new Set(
      (allServers as Server[])
        .map((server: Server) => server.group)
        .filter(Boolean)
    );

    return Array.from(groups).sort();
  }, [allServers]);

  const runningServers = (servers as Server[])?.filter(
    (server: Server) => server.serverInfo?.status === "RUNNING"
  );

  const sortedServers = useMemo(() => {
    if (!servers) return [];
    return [...(servers as Server[])].sort((a: Server, b: Server) => {
      const groupComparison = (a.group || "").localeCompare(b.group || "");
      if (groupComparison !== 0) return groupComparison;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [servers]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Servers</h1>
          <p className="text-muted-foreground text-sm">
            Monitor your server instances
          </p>
        </div>

        <ServerFilters
          availableGroups={availableGroups}
          onFiltersChange={setFilterInput}
        />
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-16" />
            <span>•</span>
            <Skeleton className="h-4 w-16" />
            <span>•</span>
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <span>{(servers as Server[])?.length} servers</span>
            <span>•</span>
            <span>{runningServers?.length} running</span>
            <span>•</span>
            <span>
              {((servers as Server[])?.length ?? 0) -
                (runningServers?.length ?? 0)}{" "}
              stopped
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ServerCardSkeleton key={i} />
            ))
          : sortedServers.map((server) => (
              <ServerCard key={server.serverId} server={server} />
            ))}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_main/servers/")({
  head: () => {
    return {
      meta: [
        ...seo({
          title: "Servers | Atlas",
        }),
      ],
    };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      orpc.atlas.serverList.queryOptions({ input: {} })
    );
  },
  component: RouteComponent,
});
