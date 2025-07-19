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
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
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
