import { useQuery } from "@tanstack/react-query";
import { ServerIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

const TotalServersCard = () => {
  const { data: serverCount, isPending } = useQuery({
    ...orpc.atlas.serverCount.queryOptions(),
    refetchInterval: 5000,
  });

  return (
    <Card className="p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          {isPending ? (
            <>
              <Skeleton className="mb-1 h-6 w-16" />
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">{serverCount?.total ?? 0}</p>
            </>
          )}
          <p className="text-muted-foreground text-sm">Servers</p>
        </div>
        <div className="rounded-lg bg-blue-500/20 p-3">
          <ServerIcon className="h-5 w-5 text-blue-500" />
        </div>
      </div>
    </Card>
  );
};

export default TotalServersCard;
