import { useQuery } from "@tanstack/react-query";
import { ActivityIcon, CpuIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

const SystemUtilizationHeaderCards = () => {
  const { data: utilization, isPending } = useQuery({
    ...orpc.atlas.utilization.queryOptions(),
    refetchInterval: 15000, // System metrics don't change frequently
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  return (
    <>
      <Card className="p-6 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            {isPending ? (
              <>
                <Skeleton className="mb-1 h-6 w-16" />
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">
                  {utilization?.cpu.formatted ?? "0%"}
                </p>
              </>
            )}
            <p className="text-muted-foreground text-sm">CPU</p>
          </div>
          <div className="rounded-lg bg-orange-500/20 p-3">
            <CpuIcon className="h-5 w-5 text-orange-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            {isPending ? (
              <>
                <Skeleton className="mb-1 h-6 w-16" />
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">
                  {utilization?.bandwidth.usedFormatted ?? "0 GB/s"}
                </p>
              </>
            )}
            <p className="text-muted-foreground text-sm">Network</p>
          </div>
          <div className="rounded-lg bg-purple-500/20 p-3">
            <ActivityIcon className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </Card>
    </>
  );
};

export default SystemUtilizationHeaderCards;
