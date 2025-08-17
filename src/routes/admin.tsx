import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
} from "@tanstack/react-router";
import { BarChart3, FileText, Shield, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
  },
];

const RouteComponent = () => {
  const location = useLocation();

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-card/50 w-64 border-r backdrop-blur-sm">
        <Link to="/" className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-6 w-6" />
            <h1 className="text-lg font-semibold">Atlas Admin</h1>
          </div>
        </Link>

        <nav className="p-4">
          <ul className="space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/admin" &&
                  location.pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-card/30 h-16 border-b backdrop-blur-sm">
          <div className="flex h-full items-center px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {adminNavItems.find(
                  (item) =>
                    location.pathname === item.href ||
                    (item.href !== "/admin" &&
                      location.pathname.startsWith(item.href))
                )?.title || "Dashboard"}
              </h2>
            </div>
          </div>
        </div>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});
