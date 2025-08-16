import { createFileRoute } from "@tanstack/react-router";

const RouteComponent = () => {
  return (
    <div className="space-y-6">
      <div className="pb-6">
        <h1 className="text-foreground text-3xl font-semibold">
          Administration Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Please use the sidebar to navigate to the different sections of the
          panel.
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});
