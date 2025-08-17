import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { AuditLogsView } from "@/routes/admin/audit-logs";

const RouteComponent = () => {
  const { groupId } = Route.useParams();
  
  const { data: group } = useQuery({
    ...orpc.atlas.getGroup.queryOptions({ input: { group: groupId } }),
  });
  
  return (
    <AuditLogsView 
      mode="group" 
      resourceId={groupId}
      resourceName={group?.displayName}
      compact={true}
    />
  );
};

export const Route = createFileRoute("/_main/groups/$groupId/activity")({
  component: RouteComponent,
});