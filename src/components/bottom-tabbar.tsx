import { Link } from "@tanstack/react-router";
import {
  LayoutDashboardIcon,
  Server,
  Settings,
  Users,
} from "lucide-react";

const BottomTabbar = () => {
  const links = [
    {
      name: "Overview",
      icon: LayoutDashboardIcon,
      to: "/",
    },
    {
      name: "Groups",
      icon: Users,
      to: "/groups",
    },
    {
      name: "Servers",
      icon: Server,
      to: "/servers",
    },
    {
      name: "Admin",
      icon: Settings,
      to: "/admin",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden">
      <div className="grid grid-cols-4 gap-1 px-2 py-2 pb-safe">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.to}
            className="text-muted-foreground hover:text-foreground flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            activeProps={{
              className: "!text-primary bg-primary/10",
            }}
          >
            <link.icon className="h-5 w-5" />
            <span className="truncate">{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomTabbar;