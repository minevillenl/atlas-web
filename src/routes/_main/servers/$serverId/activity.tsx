import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { AuditLogsView } from "@/routes/admin/audit-logs";

const RouteComponent = () => {
  const { serverId } = Route.useParams();
  
  const { data: server } = useQuery({
    ...orpc.atlas.getServer.queryOptions({
      input: { server: serverId },
    }),
  });
  
  const isStatic = server?.type !== "DYNAMIC";
  
  return (
    <AuditLogsView 
      mode="server" 
      resourceId={serverId}
      resourceName={server?.name}
      isStatic={isStatic}
      compact={true}
    />
  );
};

export const Route = createFileRoute("/_main/servers/$serverId/activity")({
  component: RouteComponent,
});