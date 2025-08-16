import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  dehydrate,
  hydrate,
} from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { toast } from "sonner";

import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30, // Reduce stale time to 30 seconds
        gcTime: 1000 * 30, // Reduce garbage collection time to 30 seconds
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error("Failed to fetch data", {
          description: process.env.PROD ? undefined : error.message,
          duration: 5000,
          action: {
            label: "Retry",
            onClick: () => {
              queryClient.invalidateQueries();
            },
          },
        });
      },
    }),
  });

  const routerContext = {
    queryClient,
    auth: {
      isAuthenticated: false,
    },
  };

  const router = createTanStackRouter({
    routeTree,
    context: routerContext,
    dehydrate: () => {
      return {
        queryClientState: dehydrate(queryClient),
      };
    },
    hydrate: (dehydrated) => {
      hydrate(queryClient, dehydrated.queryClientState);
    },
    Wrap: ({ children }) => {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    },
    trailingSlash: "never",
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
  });

  if (typeof window !== "undefined") {
    window.getRouter = () => router;
    window.getQueryClient = () => queryClient;
    
    // Aggressive cache cleanup to prevent memory leaks
    setInterval(() => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Remove queries that haven't been used recently
      queries.forEach((query) => {
        const lastAccessed = query.state.dataUpdatedAt;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (lastAccessed < fiveMinutesAgo) {
          cache.remove(query);
        }
      });
      
      // Force garbage collection on older queries only
      // Don't clear everything as this breaks the app
      
      // Keep only essential queries for current route
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/servers/")) {
        // If not on server pages, clear all server-related queries
        queryClient.removeQueries({
          predicate: (query) => {
            return query.queryKey.some(key => 
              typeof key === "string" && 
              (key.includes("getServer") || key.includes("getServerLogs") || key.includes("getServerFiles"))
            );
          }
        });
      }
    }, 60000); // Clean up every minute
  }

  return routerWithQueryClient(router, queryClient);
}

declare module "@tanstack/react-router" {
  // eslint-disable-next-line no-unused-vars
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    getRouter: () => ReturnType<typeof createRouter>;
    getQueryClient: () => QueryClient;
  }
}
