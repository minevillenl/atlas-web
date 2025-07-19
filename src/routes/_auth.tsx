import { Outlet, createFileRoute } from "@tanstack/react-router";

const RouteComponent = () => {
  return (
    <div className="site-container">
      <div className="content-container flex flex-grow items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});
