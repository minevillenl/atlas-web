import { useQuery } from "@tanstack/react-query";
import { HardDriveIcon, WifiIcon, ZapIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

const SystemUtilizationCard = () => {
  const { data: utilization, isPending } = useQuery({
    ...orpc.atlas.utilization.queryOptions(),
    refetchInterval: 15000, // Reduce system metrics polling
    staleTime: 10000,
  });

  const SkeletonCard = () => (
    <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div>
          <Skeleton className="mb-2 h-5 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="mb-2 h-7 w-12" />
        <Skeleton className="h-2 w-16 rounded-full" />
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">System Utilization</h2>
      <div className="space-y-4">
        {isPending ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/20 p-2">
                  <ZapIcon className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Memory</p>
                  <p className="text-muted-foreground text-sm">
                    {utilization?.memory.usedFormatted} used
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-500">
                  {utilization?.memory.percentage.toFixed(0)}%
                </p>
                <div className="bg-muted mt-1 h-2 w-16 rounded-full">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{
                      width: `${utilization?.memory.percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/20 p-2">
                  <HardDriveIcon className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Disk</p>
                  <p className="text-muted-foreground text-sm">
                    {utilization?.disk.usedFormatted} used
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-500">
                  {utilization?.disk.percentage.toFixed(0)}%
                </p>
                <div className="bg-muted mt-1 h-2 w-16 rounded-full">
                  <div
                    className="h-2 w-[45%] rounded-full bg-yellow-500"
                    style={{
                      width: `${utilization?.disk.percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/20 p-2">
                  <WifiIcon className="h-4 w-4 text-cyan-500" />
                </div>
                <div>
                  <p className="font-medium">Bandwidth</p>
                  <p className="text-muted-foreground text-sm">
                    {utilization?.bandwidth.sendFormatted} out
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-cyan-500">
                  {utilization?.bandwidth.percentage.toFixed(0)}%
                </p>
                <div className="bg-muted mt-1 h-2 w-16 rounded-full">
                  <div
                    className="h-2 rounded-full bg-cyan-500"
                    style={{
                      width: `${utilization?.bandwidth.percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default SystemUtilizationCard;
